import hljs from "highlight.js";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
// @ts-expect-error
import Prism from "prism-react-renderer/prism";
import { Fragment } from "react";
import styled from "styled-components";

import { DocumentHead } from "components/shared/seo";
import { Title } from "styles/typography";
import { KARMA_PRISM_THEME } from "utils/mdx";

(typeof global !== "undefined" ? global : window).Prism = Prism;

require("prismjs/components/prism-elixir");

const Index = () => {
	return (
		<Fragment>
			<DocumentHead title="Karma" />
			<Title>Karma — a VSCode theme</Title>
			<HighlightKarma code={JSX_STRING} />
			<HighlightKarma code={PYTHON_STRING} language="python" />
			<HighlightKarma code={JS_STRING} language="javascript" />
			<HighlightKarma code={CSS_STRING} language="css" />
			{/* @ts-expect-error */}
			<HighlightKarma code={ELIXIR_STRING} language="elixir" />
		</Fragment>
	);
};

export default Index;

export function Highlighter(content: string, language?: string): JSX.Element {
	const highlighted = language
		? hljs.highlight(language, content)
		: hljs.highlightAuto(content);

	return (
		<pre className="hljs">
			<code
				className="hljs"
				dangerouslySetInnerHTML={{ __html: highlighted.value }}
			/>
		</pre>
	);
}

type THiglightProps = {
	code: string;
	language?: Language;
};

export const HighlightKarma = ({ code, language = "jsx" }: THiglightProps) => (
	<Highlight
		{...defaultProps}
		{...{ code, language }}
		theme={KARMA_PRISM_THEME}
	>
		{({ className, style, tokens, getLineProps, getTokenProps }) => (
			<CodePreBlockWithHighlight {...{ style, className }}>
				<CodeBlockLanguageWrapper>
					{language.toLocaleUpperCase()}
				</CodeBlockLanguageWrapper>
				{tokens.map((line, i) => {
					const lineProps = getLineProps({ line, key: i });
					return (
						<div {...lineProps} key={i}>
							<CodeblockLineNumber>{i + 1}</CodeblockLineNumber>
							{line.map((token, key) => (
								<span {...getTokenProps({ token, key })} key={key} />
							))}
						</div>
					);
				})}
			</CodePreBlockWithHighlight>
		)}
	</Highlight>
);

const CodeBlockLanguageWrapper = styled.span`
	float: right;
	background-color: rgba(256, 256, 256, 0.09);
	color: rgba(256, 256, 256, 0.6);
	margin-top: -15px;
	padding: 5px;
	border-bottom-left-radius: var(--border-radius);
	border-bottom-right-radius: var(--border-radius);
`;

const CodePreBlockWithHighlight = styled.pre`
	padding: 15px;
	margin: 16px -15px;
	border-radius: var(--border-radius);
	overflow-x: scroll;
	white-space: pre-wrap;
	word-wrap: break-word;

	.highlight-line {
		background-color: rgb(255, 255, 255, 0.07);
		display: block;
		margin-right: -1em;
		margin-left: -1em;
		padding-right: 1em;
		padding-left: 0.75em;
		border-left: 0.3em solid #9d86e9;
	}
`;

const CodeblockLineNumber = styled.span`
	display: inline-block;
	padding-right: 0.6em;
	width: 1rem;
	user-select: none;
	opacity: 0.25;
	text-align: center;
	position: relative;
`;

const JSX_STRING = `/* @jsx jsx */
import { jsx } from "theme-ui";
import { Button as Btn } from "@theme-ui/components";
import { useThemeUI } from "theme-ui";

export default props => {
  const { theme } = useThemeUI();
  return (
    <Btn
      {...props}
      sx={{
        ...props.sx,
        "&:focus": {
          outline: "none",
          boxShadow: \`0 0 0 0.25em \${theme.colors.secondary}\`
        }
      }}
      variant="styles.Button"
    />
  );
};
`;

const PYTHON_STRING = `def fizzbuzz(n):
    if n % 3 == 0 and n % 5 == 0:
        return 'FizzBuzz'
    elif n % 3 == 0:
        return 'Fizz'
    elif n % 5 == 0:
        return 'Buzz'
    else:
        return str(n)
print "\\n".join(fizzbuzz(n) for n in xrange(1, 21))`;

const CSS_STRING = `.code-toolbar {
	position: relative;
}

div.code-toolbar > .toolbar {
	position: absolute;
	top: .3em;
	right: .2em;
	transition: opacity 0.3s ease-in-out;
	opacity: 0;
}

div.code-toolbar:hover > .toolbar {
	opacity: 1;
}

/* Separate line b/c rules are thrown out if selector is invalid.
   IE11 and old Edge versions don't support :focus-within. */
div.code-toolbar:focus-within > .toolbar {
	opacity: 1;
}

div.code-toolbar > .toolbar .toolbar-item {
	display: inline-block;
}

div.code-toolbar > .toolbar a {
	cursor: pointer;
}

div.code-toolbar > .toolbar button {
	background: none;
	border: 0;
	color: inherit;
	font: inherit;
	line-height: normal;
	overflow: visible;
	padding: 0;
	-webkit-user-select: none; /* for button */
	-moz-user-select: none;
	-ms-user-select: none;
}

div.code-toolbar > .toolbar a,
div.code-toolbar > .toolbar button,
div.code-toolbar > .toolbar span {
	color: #bbb;
	font-size: .8em;
	padding: 0 .5em;
	background: #f5f2f0;
	background: rgba(224, 224, 224, 0.2);
	box-shadow: 0 2px 0 0 rgba(0,0,0,0.2);
	border-radius: .5em;
}

div.code-toolbar > .toolbar a:hover,
div.code-toolbar > .toolbar a:focus,
div.code-toolbar > .toolbar button:hover,
div.code-toolbar > .toolbar button:focus,
div.code-toolbar > .toolbar span:hover,
div.code-toolbar > .toolbar span:focus {
	color: inherit;
	text-decoration: none;
}
`;

const JS_STRING = `function $initHighlight(block, cls) {
  try {
    if (cls.search(/\\bno\\-highlight\\b/) != -1)
      return process(block, true, 0x0F) +
             \` class="\${cls}"\`;
  } catch (e) {
    /* handle exception */
  }
  for (var i = 0 / 2; i < classes.length; i++) {
    if (checkCondition(classes[i]) === undefined)
      console.log('undefined');
  }

  return (
    <div>
      <web-component>{block}</web-component>
    </div>
  )
}
`;

const ELIXIR_STRING = `defmodule RealWorld.Accounts.Users do
  @moduledoc """
  The boundry for the Users system
  """

  alias RealWorld.Repo
  alias RealWorld.Accounts.User
  alias RealWorld.Accounts.UserFollower

  def get_user!(id), do: Repo.get!(User, id)
  def get_by_username(username), do: Repo.get_by(User, username: username)

  def update_user(user, attrs) do
    user
    |> User.changeset(attrs)
    |> RealWorld.Accounts.Auth.hash_password()
    |> Repo.update()
  end

  def follow(user, followee) do
    %UserFollower{}
    |> UserFollower.changeset(%{user_id: user.id, followee_id: followee.id})
    |> Repo.insert()
  end

  def unfollow(user, followee) do
    relation =
      UserFollower
      |> Repo.get_by(user_id: user.id, followee_id: followee.id)

    case relation do
      nil ->
        false

      relation ->
        Repo.delete(relation)
    end
  end

  def is_following?(user, followee) do
    if user != nil && followee != nil do
      UserFollower |> Repo.get_by(user_id: user.id, followee_id: followee.id) != nil
    else
      nil
    end
  end
end`;
