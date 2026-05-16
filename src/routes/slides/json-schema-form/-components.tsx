import type * as monaco from "modern-monaco/editor-core";

import { createHeadlessForm } from "@remoteoss/json-schema-form";
import karmaTheme from "@sreetamdas/karma/themes/default.json" with { type: "json" };
import { init } from "modern-monaco";
import { useState, useCallback, useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsfObjectSchema = Record<string, any>;

const PRESETS: { name: string; schema: JsfObjectSchema }[] = [
	{
		name: "Simple",
		schema: {
			type: "object",
			properties: {
				name: {
					type: "string",
					title: "Full name",
					"x-jsf-presentation": { inputType: "text" },
				},
				email: {
					type: "string",
					format: "email",
					title: "Email",
					"x-jsf-presentation": { inputType: "email" },
				},
				age: {
					type: "integer",
					title: "Age",
					minimum: 18,
					"x-jsf-presentation": { inputType: "number" },
				},
			},
			required: ["name", "email"],
		},
	},
	{
		name: "Conditional",
		schema: {
			type: "object",
			properties: {
				country: {
					type: "string",
					title: "Country",
					enum: ["US", "CA", "Other"],
					"x-jsf-presentation": { inputType: "select" },
				},
			},
			required: ["country"],
			allOf: [
				{
					if: {
						properties: { country: { const: "US" } },
						required: ["country"],
					},
					// oxlint-disable-next-line unicorn/no-thenable
					then: {
						properties: {
							state: {
								type: "string",
								title: "State",
								"x-jsf-presentation": { inputType: "text" },
							},
						},
						required: ["state"],
					},
				},
			],
		},
	},
	{
		name: "Computed",
		schema: {
			type: "object",
			properties: {
				salary: {
					type: "number",
					title: "Salary",
					"x-jsf-presentation": { inputType: "money" },
				},
				bonus: {
					type: "number",
					title: "Bonus",
					"x-jsf-presentation": { inputType: "money" },
				},
				total: {
					type: "number",
					title: "Total compensation",
					"x-jsf-presentation": { inputType: "money" },
					"x-jsf-logic-computedAttrs": {
						const: "total",
						default: "total",
					},
					readOnly: true,
				},
			},
			required: ["salary"],
			"x-jsf-logic": {
				computedValues: {
					total: {
						rule: { "+": [{ var: "salary" }, { var: "bonus" }] },
					},
				},
			},
		},
	},
];

function FieldRenderer({
	field,
	value,
	onChange,
	error,
}: {
	field: ReturnType<typeof createHeadlessForm> extends infer R
		? R extends { fields: infer F }
			? F extends Array<infer U>
				? U
				: never
			: never
		: never;
	value: unknown;
	onChange: (val: unknown) => void;
	error?: string;
}) {
	const inputClasses =
		"w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none";

	if (!field.isVisible) return null;

	const label = (
		<label className="mb-1 block text-xs font-medium text-white/70">
			{field.label ?? field.name}
			{field.required && <span className="ml-0.5 text-red-400">*</span>}
		</label>
	);

	const commonProps = {
		className: inputClasses,
		value: ((value ?? field.const ?? field.default) as string | number) ?? "",
		onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			onChange(e.target.type === "number" ? Number(e.target.value) : e.target.value);
		},
	};

	let input: React.ReactNode;

	switch (field.inputType) {
		case "select":
			input = (
				<select {...commonProps}>
					<option value="">Select…</option>
					{(
						(field.options as unknown[] | undefined) ??
						(field.enum as unknown[] | undefined) ??
						[]
					).map((opt: unknown) => {
						const val = typeof opt === "string" ? opt : ((opt as { value: string }).value ?? "");
						const label = typeof opt === "string" ? opt : ((opt as { label: string }).label ?? val);
						return (
							<option key={val} value={val}>
								{label}
							</option>
						);
					})}
				</select>
			);
			break;
		case "number":
		case "money":
			input = <input type="number" readOnly={field.readOnly === true} {...commonProps} />;
			break;
		case "email":
			input = <input type="email" readOnly={field.readOnly === true} {...commonProps} />;
			break;
		case "checkbox":
			input = (
				<input
					type="checkbox"
					className="h-4 w-4 rounded border-white/10 bg-white/5"
					checked={Boolean(value)}
					onChange={(e) => onChange(e.target.checked)}
				/>
			);
			break;
		case "radio":
			input = (
				<div className="flex flex-col gap-1">
					{(
						(field.options as unknown[] | undefined) ??
						(field.enum as unknown[] | undefined) ??
						[]
					).map((opt: unknown) => {
						const val = typeof opt === "string" ? opt : ((opt as { value: string }).value ?? "");
						return (
							<label key={val} className="flex items-center gap-2 text-sm text-white/80">
								<input
									type="radio"
									name={field.name}
									value={val}
									checked={value === val}
									onChange={() => onChange(val)}
									className="h-4 w-4 border-white/10 bg-white/5"
								/>
								{val}
							</label>
						);
					})}
				</div>
			);
			break;
		default:
			input = <input type="text" readOnly={field.readOnly === true} {...commonProps} />;
	}

	return (
		<div className="mb-3">
			{field.inputType !== "checkbox" ? label : null}
			<div className={field.inputType === "checkbox" ? "flex items-center gap-2" : ""}>
				{input}
				{field.inputType === "checkbox" ? (
					<span className="text-sm text-white/80">{field.label ?? field.name}</span>
				) : null}
			</div>
			{error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
			{field.description ? <p className="mt-1 text-xs text-white/40">{field.description}</p> : null}
		</div>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormValues = Record<string, any>;

function MonacoEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const modelRef = useRef<monaco.editor.ITextModel | null>(null);
	const isUpdatingRef = useRef(false);

	useEffect(() => {
		if (!containerRef.current) return;

		let disposed = false;

		void init({
			langs: ["json"],
			defaultTheme: "one-dark-pro",
			lsp: {
				json: {
					allowComments: true,
				},
			},
		}).then((monaco) => {
			if (disposed || !containerRef.current) return;

			// Register Karma theme using Monaco's native defineTheme API
			const karmaTokenColors = (karmaTheme as Record<string, unknown>).tokenColors as Array<{
				scope: string | string[];
				settings: { foreground?: string; fontStyle?: string };
			}>;
			const rules = karmaTokenColors.flatMap((tc) => {
				const scopes = typeof tc.scope === "string" ? [tc.scope] : (tc.scope ?? []);
				return scopes.map((scope) => {
					const rule: { token: string; foreground?: string; fontStyle?: string } = { token: scope };
					if (tc.settings?.foreground) rule.foreground = tc.settings.foreground.replace("#", "");
					if (tc.settings?.fontStyle) rule.fontStyle = tc.settings.fontStyle;
					return rule;
				});
			});

			monaco.editor.defineTheme("karma", {
				base: "vs-dark",
				inherit: true,
				rules,
				colors: (karmaTheme as Record<string, unknown>).colors as Record<string, string>,
			});

			const model = monaco.editor.createModel(value, "json");
			modelRef.current = model;

			const editor = monaco.editor.create(containerRef.current, {
				model,
				theme: "karma",
				automaticLayout: true,
				fontSize: 12,
				lineHeight: 1.625,
				padding: { top: 12, bottom: 12 },
				minimap: { enabled: false },
				scrollBeyondLastLine: false,
				overviewRulerLanes: 0,
				hideCursorInOverviewRuler: true,
				renderLineHighlight: "none",
				scrollbar: {
					verticalScrollbarSize: 6,
					horizontalScrollbarSize: 6,
					useShadows: false,
				},
				wordWrap: "off",
				tabSize: 2,
			});

			editorRef.current = editor;

			editor.onDidChangeModelContent(() => {
				if (isUpdatingRef.current) return;
				const newValue = model.getValue();
				onChange(newValue);
			});
		});

		return () => {
			disposed = true;
			editorRef.current?.dispose();
			modelRef.current?.dispose();
			editorRef.current = null;
			modelRef.current = null;
		};
	}, []);

	// Sync external value changes (e.g., preset switch) to editor
	useEffect(() => {
		if (modelRef.current && value !== modelRef.current.getValue()) {
			isUpdatingRef.current = true;
			modelRef.current.setValue(value);
			isUpdatingRef.current = false;
		}
	}, [value]);

	return (
		<div className="relative flex-1 overflow-hidden">
			<div ref={containerRef} className="absolute inset-0" />
		</div>
	);
}

export function JsfPlayground() {
	const [activePreset, setActivePreset] = useState(0);
	const [schemaText, setSchemaText] = useState(() => JSON.stringify(PRESETS[0].schema, null, 2));
	const [values, setValues] = useState<FormValues>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [parseError, setParseError] = useState<string | null>(null);

	const parsedSchema: JsfObjectSchema | null = (() => {
		try {
			const parsed = JSON.parse(schemaText);
			if (parsed.type === "object") return parsed as JsfObjectSchema;
			return null;
		} catch {
			return null;
		}
	})();

	const formResult = parsedSchema
		? createHeadlessForm(parsedSchema, { initialValues: values })
		: null;

	const handleValidate = useCallback(() => {
		if (!formResult) return;
		const result = formResult.handleValidation(values);
		const flatErrors: Record<string, string> = {};
		const flatten = (obj: Record<string, unknown>, prefix = "") => {
			for (const [key, val] of Object.entries(obj)) {
				if (typeof val === "string") flatErrors[prefix + key] = val;
				else if (val && typeof val === "object")
					flatten(val as Record<string, unknown>, prefix + key + ".");
			}
		};
		if (result.formErrors) flatten(result.formErrors);
		setErrors(flatErrors);
	}, [formResult, values]);

	const loadPreset = (index: number) => {
		setActivePreset(index);
		setSchemaText(JSON.stringify(PRESETS[index].schema, null, 2));
		setValues({});
		setErrors({});
		setParseError(null);
	};

	return (
		<div className="flex h-full flex-col">
			{/* Preset tabs */}
			<div className="mb-2 flex gap-2">
				{PRESETS.map((p, i) => (
					<button
						key={p.name}
						onClick={() => loadPreset(i)}
						className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
							i === activePreset
								? "bg-white text-black"
								: "bg-white/10 text-white/70 hover:bg-white/20"
						}`}
					>
						{p.name}
					</button>
				))}
			</div>

			<div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden">
				{/* Schema editor */}
				<div className="flex flex-col overflow-hidden rounded border border-white/10 bg-black/30">
					<div className="border-b border-white/10 px-3 py-1.5 text-xs font-medium text-white/50">
						JSON Schema
					</div>
					<MonacoEditor
						value={schemaText}
						onChange={(v) => {
							setSchemaText(v);
							try {
								JSON.parse(v);
								setParseError(null);
							} catch (err) {
								setParseError((err as Error).message);
							}
						}}
					/>
					{parseError ? (
						<div className="border-t border-white/10 px-3 py-1.5 text-xs text-red-400">
							{parseError}
						</div>
					) : null}
				</div>

				{/* Form preview */}
				<div className="flex flex-col overflow-hidden rounded border border-white/10 bg-black/30">
					<div className="border-b border-white/10 px-3 py-1.5 text-xs font-medium text-white/50">
						Live Form
					</div>
					<div className="flex-1 overflow-y-auto p-4">
						{formResult?.isError ? (
							<div className="text-sm text-red-400">{formResult.error}</div>
						) : formResult ? (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleValidate();
								}}
							>
								{(formResult.fields ?? []).map((field) => (
									<FieldRenderer
										key={field.name}
										field={field}
										value={values[field.name]}
										onChange={(val) => {
											setValues((prev) => ({ ...prev, [field.name]: val }));
											// Clear error for this field on change
											setErrors((prev) => {
												const next = { ...prev };
												delete next[field.name];
												return next;
											});
										}}
										error={errors[field.name]}
									/>
								))}
								<button
									type="submit"
									className="mt-2 rounded bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-80"
								>
									Validate
								</button>
							</form>
						) : (
							<div className="text-sm text-white/40">Invalid schema</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
