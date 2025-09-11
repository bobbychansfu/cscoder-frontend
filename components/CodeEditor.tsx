"use client";

import React, { useEffect, useRef } from 'react';
import {
    EditorView,
    keymap,
    highlightSpecialChars,
    drawSelection,
    highlightActiveLine,
    lineNumbers
} from '@codemirror/view';
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } from '@codemirror/language';
import { tomorrow } from 'thememirror';

import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';

import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets } from '@codemirror/autocomplete';
import { EditorState, Compartment } from '@codemirror/state';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
}

function getLanguageExtension(language: string) {
    const lang = language.toLowerCase();
    
    switch (lang) {
        case 'javascript':
            return javascript();
        case 'java':
            return java();
        case 'c++':
            return cpp();
        case 'python':
            return python();
        default:
            return javascript(); 
    }
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language }) => {
    const languageCompartment = useRef(new Compartment());
    const editorViewRef = useRef<EditorView | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editorContainerRef.current) return;

        const startState = EditorState.create({
            doc: value,
            extensions: [
                lineNumbers(),
                highlightSpecialChars(),
                drawSelection(),
                highlightActiveLine(),
                indentOnInput(),
                syntaxHighlighting(defaultHighlightStyle),
                bracketMatching(),
                closeBrackets(),
                keymap.of([indentWithTab, ...defaultKeymap]),
                languageCompartment.current.of(getLanguageExtension(language)),
                EditorState.tabSize.of(4),
                EditorView.lineWrapping,
                EditorView.updateListener.of(update => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString());
                    }
                }),
                tomorrow
            ],
        });

        const editorView = new EditorView({
            state: startState,
            parent: editorContainerRef.current,
        });

        editorViewRef.current = editorView;

        return () => {
            editorView.destroy();
        };
    }, []);

    useEffect(() => {
        const editorView = editorViewRef.current;
        if (editorView) {
            const currentValue = editorView.state.doc.toString();
            if (value !== currentValue) {
                editorView.dispatch({
                    changes: {
                        from: 0,
                        to: currentValue.length,
                        insert: value,
                    },
                });
            }
        }
    }, [value]);

    useEffect(() => {
        const editorView = editorViewRef.current;
        if (editorView) {
            editorView.dispatch({
                effects: languageCompartment.current.reconfigure(getLanguageExtension(language)),
            });
        }
    }, [language]);

    return <div className="h-96 w-full border border-gray-300 rounded-md overflow-hidden" ref={editorContainerRef}></div>
};

export default CodeEditor;
