import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { useContextOrThrow } from "./helpers/reactHelpers";
import { UrlEditorStoreContext } from "./stores/URLEditorStore";
import { parseUrl, UrlPart } from "./helpers/urlHelpers";

export const URLParameterEditor = observer(() => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const urlEditorStore = useContextOrThrow(UrlEditorStoreContext);
    const [localUrl, setLocalUrl] = useState<string>(urlEditorStore.url);
    const [localParts, setLocalParts] = useState<UrlPart[]>(parseUrl(localUrl)?.parts ?? []);

    const handleSpecialKeys = useCallback((e: React.KeyboardEvent<HTMLDivElement>): boolean => {
        if (e.ctrlKey && e.key === " ") {
            e.preventDefault();
            console.log("ctrl + space");
            return true;
        }

        return false;
    }, []);

    const handleFocus = useCallback(
        (_e: React.FocusEvent<HTMLDivElement>) => {
            setIsEditing(true);
        },
        [setIsEditing]
    );

    const handleBlur = (_e: React.FocusEvent<HTMLDivElement>) => {
        const url = editorRef.current?.textContent ?? "";
        setLocalUrl(url);

        if (url.trim()) {
            const parsedUrl = parseUrl(url);
            if (parsedUrl) {
                setLocalParts(parsedUrl.parts);
                urlEditorStore.url = parsedUrl.normalisedUrl;
            }
        }

        setIsEditing(false);
    };

    return (
        <EditorContainer>
            <URLEditor
                ref={editorRef}
                contentEditable
                onKeyDown={handleSpecialKeys}
                onFocus={handleFocus}
                onBlur={handleBlur}
                suppressContentEditableWarning={true}
            >
                {isEditing
                    ? localUrl
                    : localParts.map((part, i) =>
                          part.type === "other" ? (
                              part.value + "?"
                          ) : (
                              <span className="parameter-container" key={`${part.key}-${i}`}>
                                  <span className="parameter parameter-key">{part.key}</span>=
                                  <span className="parameter parameter-value">{part.value}</span>
                              </span>
                          )
                      )}
            </URLEditor>
        </EditorContainer>
    );
});

const EditorContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: "Courier New", monospace;
`;

const URLEditor = styled.div`
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    line-height: 1.4;
    min-height: 50px;
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    background-color: #fafafa;

    &:focus {
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    > span {
        display: inline;
    }

    .parameter-container + .parameter-container::before {
        content: "&";
    }

    .parameter-key {
        background-color: #fff3e0;
        color: #e65100;
    }

    .parameter-value {
        background-color: #e8f5e8;
        color: #2e7d32;
    }

    .parameter-separator {
        color: #666;
        font-weight: normal;
    }
`;
