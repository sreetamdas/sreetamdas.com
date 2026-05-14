import { createHeadlessForm } from "@remoteoss/json-schema-form";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import type { KarmaHighlighter } from "@/lib/domains/shiki/highlighter";

import { getSlimKarmaHighlighter } from "@/lib/domains/shiki/highlighter";
import { renderCodeBlockToHtml } from "@/lib/domains/shiki/plugin";

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
		value: (value as string | number) ?? "",
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
			input = <input type="number" {...commonProps} />;
			break;
		case "email":
			input = <input type="email" {...commonProps} />;
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
			input = <input type="text" {...commonProps} />;
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

function ShikiEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	const [highlighter, setHighlighter] = useState<KarmaHighlighter | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const shikiRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		getSlimKarmaHighlighter().then(setHighlighter);
	}, []);

	const highlighted = useMemo(() => {
		if (!highlighter) return null;
		const html = renderCodeBlockToHtml(highlighter, value, "json", null);
		return html ? html.replace(/ tabindex="0"/g, "") : null;
	}, [highlighter, value]);

	const handleScroll = useCallback(() => {
		if (textareaRef.current && shikiRef.current) {
			shikiRef.current.scrollTop = textareaRef.current.scrollTop;
			shikiRef.current.scrollLeft = textareaRef.current.scrollLeft;
		}
	}, []);

	return (
		<div className="relative flex-1 overflow-hidden">
			{/* Shiki highlighted layer — read-only, synced scroll */}
			<div
				ref={shikiRef}
				className="pointer-events-none absolute inset-0 overflow-auto p-3 [&_pre]:m-0"
				aria-hidden="true"
			>
				{highlighted ? (
					<div dangerouslySetInnerHTML={{ __html: highlighted }} />
				) : (
					<pre className="m-0 font-mono text-xs leading-relaxed text-green-300">{value}</pre>
				)}
			</div>

			{/* Transparent textarea — captures all input */}
			<textarea
				ref={textareaRef}
				className="absolute inset-0 h-full w-full resize-none bg-transparent p-3 font-mono text-xs leading-relaxed text-transparent caret-white focus:outline-none"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onScroll={handleScroll}
				spellCheck={false}
			/>
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
		<div className="flex h-[60vh] flex-col">
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
					<ShikiEditor
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
