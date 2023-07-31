#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p public/shiki

# Copy the required files and directories
cp -r node_modules/shiki/dist public/shiki/

mkdir -p public/shiki/languages
# Define the languages you want to copy
languages=(
	"javascript"
	"jsx"
	"typescript"
	"tsx"
	"json"
	"mdx"
	"markdown"
	"css"
	"shellscript"
	"elixir"
)

# Loop through the languages and copy the corresponding files
for lang in "${languages[@]}"; do
	cp "node_modules/shiki/languages/${lang}.tmLanguage.json" "public/shiki/languages/"
done
