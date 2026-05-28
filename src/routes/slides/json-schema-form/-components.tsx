import type * as monaco from "modern-monaco/editor-core";

import { createHeadlessForm, type CreateHeadlessFormOptions } from "@remoteoss/json-schema-form";
import karmaTheme from "@sreetamdas/karma/themes/default.json" with { type: "json" };
import { init } from "modern-monaco";
import { useState, useCallback, useEffect, useRef } from "react";

type KarmaThemeJson = {
	tokenColors: Array<{
		scope: string | string[];
		settings: { foreground?: string; fontStyle?: string };
	}>;
	colors: Record<string, string>;
};

const themeConfig: KarmaThemeJson = karmaTheme;

type JsfObjectSchema = Parameters<typeof createHeadlessForm>[0];

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
				state: {
					type: "string",
					title: "State",
					"x-jsf-presentation": { inputType: "text" },
				},
			},
			required: ["country"],
			allOf: [
				{
					if: { properties: { country: { const: "US" } } },
					then: { required: ["state"] },
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

function resolveFieldValue(value: unknown, const_: unknown, default_: unknown): string | number {
	const resolved = value ?? const_ ?? default_;
	if (typeof resolved === "string" || typeof resolved === "number") return resolved;
	return "";
}

type SelectOption = { value: string; label: string };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isJsfObjectSchema(value: unknown): value is JsfObjectSchema {
	if (!isRecord(value)) {
		return false;
	}

	return value.type === "object";
}

function toSelectOption(input: unknown): SelectOption | undefined {
	if (typeof input === "string") {
		return { value: input, label: input };
	}

	if (typeof input !== "object" || input === null) {
		return undefined;
	}

	const value = "value" in input ? input.value : undefined;
	if (typeof value !== "string") {
		return undefined;
	}

	const label = "label" in input && typeof input.label === "string" ? input.label : value;
	return { value, label };
}

function getFieldOptions(field: { options?: unknown; enum?: unknown }): Array<SelectOption> {
	const source = Array.isArray(field.options)
		? field.options
		: Array.isArray(field.enum)
			? field.enum
			: [];

	return source
		.map((option) => toSelectOption(option))
		.filter((option): option is SelectOption => option !== undefined);
}

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
	value: FormValues[string] | undefined;
	onChange: (val: FormValues[string]) => void;
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
		value: resolveFieldValue(value, field.const, field.default),
		onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			onChange(e.target.type === "number" ? Number(e.target.value) : e.target.value);
		},
	};

	let input: React.ReactNode;
	const options = getFieldOptions(field);

	switch (field.inputType) {
		case "select":
			input = (
				<select {...commonProps}>
					<option value="">Select…</option>
					{options.map((option) => {
						return (
							<option key={option.value} value={option.value}>
								{option.label}
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
					{options.map((option) => {
						return (
							<label key={option.value} className="flex items-center gap-2 text-sm text-white/80">
								<input
									type="radio"
									name={field.name}
									value={option.value}
									checked={value === option.value}
									onChange={() => onChange(option.value)}
									className="h-4 w-4 border-white/10 bg-white/5"
								/>
								{option.label}
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

type FormValues = {
	[key: string]: NonNullable<CreateHeadlessFormOptions["initialValues"]>;
};

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
			const karmaTokenColors = themeConfig.tokenColors;
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
				colors: themeConfig.colors,
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
			if (isJsfObjectSchema(parsed)) return parsed;
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
				else if (isRecord(val) && !Array.isArray(val)) flatten(val, prefix + key + ".");
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
								setParseError(err instanceof Error ? err.message : String(err));
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
											setValues((prev) => {
												return { ...prev, [field.name]: val };
											});
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

export function SchemaFormPreview({ schema }: { schema: JsfObjectSchema }) {
	const [values, setValues] = useState<FormValues>({});

	const formResult = createHeadlessForm(schema, { initialValues: values });

	return (
		<div className="grid grid-cols-2 gap-4 overflow-hidden rounded border border-white/10 bg-black/30">
			<div className="flex flex-col overflow-hidden">
				<div className="border-b border-white/10 px-3 py-1.5 text-xs font-medium text-white/50">
					JSON Schema
				</div>
				<pre className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed text-green-300">
					{JSON.stringify(schema, null, 2)}
				</pre>
			</div>

			<div className="flex flex-col overflow-hidden">
				<div className="border-b border-white/10 px-3 py-1.5 text-xs font-medium text-white/50">
					Live Form
				</div>
				<div className="flex-1 overflow-y-auto p-4">
					{formResult?.isError ? (
						<div className="text-sm text-red-400">{formResult.error}</div>
					) : formResult ? (
						<form>
							{(formResult.fields ?? []).map((field) => (
								<FieldRenderer
									key={field.name}
									field={field}
									value={values[field.name]}
									onChange={(val) => {
										setValues((prev) => {
											return { ...prev, [field.name]: val };
										});
									}}
								/>
							))}
						</form>
					) : (
						<div className="text-sm text-white/40">Invalid schema</div>
					)}
				</div>
			</div>
		</div>
	);
}
