import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { urlEditorStore } from './store';

export const URLParameterEditor = observer(() => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompletePosition, setAutocompletePosition] = useState(0);
    const [currentInput, setCurrentInput] = useState('');
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

    const handleInput = (_e: React.FormEvent<HTMLDivElement>) => {
        if (!editorRef.current) return;

        const text = editorRef.current.textContent || '';
        urlEditorStore.setUrl(text);

        // Check for autocomplete trigger when typing
        triggerAutocomplete();
    };

    const triggerAutocomplete = () => {
        if (!editorRef.current) return;

        const cursorPosition = getCursorPosition();
        if (cursorPosition === -1) return;

        const text = editorRef.current.textContent || '';
        const paramContext = findParameterContext(text, cursorPosition);

        if (!paramContext) {
            setShowAutocomplete(false);
            return;
        }

        const { currentParamText, position } = paramContext;
        setCurrentInput(currentParamText);
        setAutocompletePosition(position);

        if (currentParamText.includes('=')) {
            setShowAutocomplete(false);
            return;
        }

        const suggestions = getSuggestions(currentParamText);
        setShowAutocomplete(suggestions.length > 0);
        setSelectedSuggestionIndex(0);
    };

    const getCursorPosition = (): number => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return -1;

        return selection.getRangeAt(0).startOffset;
    };

    const findParameterContext = (text: string, cursorPosition: number) => {
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lastQuestionMark = textBeforeCursor.lastIndexOf('?');
        const lastAmpersand = textBeforeCursor.lastIndexOf('&');

        const paramStart = Math.max(lastQuestionMark, lastAmpersand);
        if (paramStart === -1) return null;

        return {
            currentParamText: textBeforeCursor.substring(paramStart + 1),
            position: cursorPosition,
        };
    };

    const getSuggestions = (currentParamText: string) => {
        if (currentParamText === '') {
            return urlEditorStore.autocompleteSuggestions;
        }

        return urlEditorStore.autocompleteSuggestions.filter((suggestion) => suggestion.toLowerCase().startsWith(currentParamText.toLowerCase()));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (handleSpecialKeys(e)) return;
        if (!showAutocomplete) return;

        handleAutocompleteNavigation(e);
    };

    const handleSpecialKeys = (e: React.KeyboardEvent<HTMLDivElement>): boolean => {
        if (e.ctrlKey && e.key === ' ') {
            e.preventDefault();
            triggerAutocomplete();
            return true;
        }
        return false;
    };

    const handleAutocompleteNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const keyHandlers = {
            ArrowDown: () => navigateSuggestion(1),
            ArrowUp: () => navigateSuggestion(-1),
            Enter: () => selectCurrentSuggestion(),
            Tab: () => selectCurrentSuggestion(),
            Escape: () => setShowAutocomplete(false),
        };

        const handler = keyHandlers[e.key as keyof typeof keyHandlers];
        if (handler) {
            e.preventDefault();
            handler();
        }
    };

    const navigateSuggestion = (direction: number) => {
        const filteredSuggestions = getSuggestions(currentInput);
        const maxIndex = filteredSuggestions.length - 1;

        setSelectedSuggestionIndex((prev) => {
            const newIndex = prev + direction;
            return Math.max(0, Math.min(newIndex, maxIndex));
        });
    };

    const selectCurrentSuggestion = () => {
        const filteredSuggestions = getSuggestions(currentInput);
        const suggestion = filteredSuggestions[selectedSuggestionIndex];

        if (suggestion) {
            selectSuggestion(suggestion);
        }
    };

    const selectSuggestion = (suggestion: string) => {
        if (!editorRef.current) return;

        const text = editorRef.current.textContent || '';
        const beforeCursor = text.substring(0, autocompletePosition - currentInput.length);
        const afterCursor = text.substring(autocompletePosition);

        const newText = beforeCursor + suggestion + '=' + afterCursor;
        editorRef.current.textContent = newText;
        urlEditorStore.setUrl(newText);
        setShowAutocomplete(false);

        // Set cursor position after the inserted parameter name
        const newCursorPosition = beforeCursor.length + suggestion.length + 1; // +1 for the '='
        const range = document.createRange();
        const selection = window.getSelection();

        if (selection) {
            range.setStart(editorRef.current.firstChild || editorRef.current, newCursorPosition);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    const handleFocus = () => {
        setIsEditing(true);
    };

    const handleBlur = (_e: React.FocusEvent<HTMLDivElement>) => {
        // Delay hiding autocomplete to allow for clicks on suggestions
        setTimeout(() => {
            setIsEditing(false);
            setShowAutocomplete(false);
            // Re-render with highlighting when focus is lost
            if (editorRef.current) {
                renderHighlightedUrl();
            }
        }, 150);
    };

    const renderHighlightedUrl = () => {
        if (!editorRef.current) return;

        const url = urlEditorStore.url;
        if (!url.trim()) {
            editorRef.current.textContent = url;
            return;
        }

        const highlightedHtml = tryParseAndHighlight(url);
        editorRef.current.innerHTML = highlightedHtml;
    };

    const tryParseAndHighlight = (url: string): string => {
        try {
            const parsedUrl = new URL(url);
            return highlightValidUrl(parsedUrl, url);
        } catch {
            return tryManualHighlight(url);
        }
    };

    const highlightValidUrl = (parsedUrl: URL, _originalUrl: string): string => {
        const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
        const queryString = parsedUrl.search || '';

        if (!queryString) return baseUrl;

        return baseUrl + highlightQueryString(queryString);
    };

    const highlightQueryString = (queryString: string): string => {
        const queryWithoutQuestion = queryString.substring(1);
        const parts = queryWithoutQuestion.split('&');

        let result = '?';
        let isFirst = true;

        for (const part of parts) {
            if (!isFirst) result += '<span class="parameter-separator">&</span>';
            isFirst = false;

            result += highlightParameter(part);
        }

        return result;
    };

    const highlightParameter = (part: string): string => {
        const equalsIndex = part.indexOf('=');

        if (equalsIndex !== -1) {
            const key = part.substring(0, equalsIndex);
            const value = part.substring(equalsIndex + 1);
            return `<span class="parameter parameter-key">${key}</span>=<span class="parameter parameter-value">${value}</span>`;
        }

        return part.trim() ? `<span class="parameter parameter-key">${part}</span>` : '';
    };

    const tryManualHighlight = (url: string): string => {
        try {
            const questionMarkIndex = url.indexOf('?');
            if (questionMarkIndex === -1) return url;

            const baseUrl = url.substring(0, questionMarkIndex);
            const queryString = url.substring(questionMarkIndex + 1);

            return baseUrl + highlightQueryString('?' + queryString);
        } catch {
            return url;
        }
    };

    useEffect(() => {
        if (!isEditing) {
            renderHighlightedUrl();
        }
    }, [urlEditorStore.url, isEditing]);

    const parameters = urlEditorStore.parameters;
    const suggestions = urlEditorStore.autocompleteSuggestions.filter((suggestion) => suggestion.toLowerCase().startsWith(currentInput.toLowerCase()));

    return (
        <EditorContainer>
            <URLEditorWrapper>
                <Title>URL Parameter Editor</Title>
                <URLEditor
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    suppressContentEditableWarning={true}
                />
                {showAutocomplete && suggestions.length > 0 && (
                    <AutocompleteDropdown>
                        {suggestions.map((suggestion, index) => (
                            <AutocompleteItem key={suggestion} $isHighlighted={index === selectedSuggestionIndex} onClick={() => selectSuggestion(suggestion)}>
                                <AutocompleteItemKey>{suggestion}</AutocompleteItemKey>
                            </AutocompleteItem>
                        ))}
                    </AutocompleteDropdown>
                )}
            </URLEditorWrapper>

            <TableContainer>
                <Title>Parameter Overview</Title>
                {parameters.length > 0 ? (
                    <ParameterTable>
                        <thead>
                            <tr>
                                <TableHeader>Parameter</TableHeader>
                                <TableHeader>Value</TableHeader>
                                <TableHeader>Status</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {parameters.map((param, index) => (
                                <TableRow key={`${param.key}-${index}`} $isInactive={!param.isActive}>
                                    <TableCell>
                                        <ParameterKeySpan>{param.key}</ParameterKeySpan>
                                    </TableCell>
                                    <TableCell>
                                        <ParameterValueSpan>{param.value}</ParameterValueSpan>
                                    </TableCell>
                                    <TableCell>
                                        <StatusSpan $isActive={param.isActive}>{param.isActive ? 'Active' : 'Removed'}</StatusSpan>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </tbody>
                    </ParameterTable>
                ) : (
                    <EmptyState>No parameters found. Try editing the URL above to add some query parameters!</EmptyState>
                )}
            </TableContainer>
        </EditorContainer>
    );
});

const EditorContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Courier New', monospace;
`;

const URLEditorWrapper = styled.div`
    position: relative;
    margin-bottom: 30px;
`;

const AutocompleteDropdown = styled.div`
    position: absolute;
    top: 100%;
    left: 15px;
    right: 15px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
`;

const AutocompleteItem = styled.div<{ $isHighlighted?: boolean }>`
    padding: 8px 12px;
    cursor: pointer;
    background-color: ${(props) => (props.$isHighlighted ? '#f8f9fa' : 'white')};
    border-bottom: 1px solid #eee;

    &:hover {
        background-color: #f8f9fa;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const AutocompleteItemKey = styled.span`
    background-color: #fff3e0;
    color: #e65100;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 500;
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

    .parameter {
        background-color: #e3f2fd;
        color: #1565c0;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 500;
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

const TableContainer = styled.div`
    margin-top: 20px;
`;

const ParameterTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
    background-color: #f8f9fa;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
`;

const TableCell = styled.td`
    padding: 12px;
    border-bottom: 1px solid #dee2e6;
    color: #495057;
`;

const TableRow = styled.tr<{ $isInactive?: boolean }>`
    &:hover {
        background-color: #f8f9fa;
    }

    opacity: ${(props) => (props.$isInactive ? 0.6 : 1)};
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
`;

const Title = styled.h2`
    color: #495057;
    margin-bottom: 15px;
    font-size: 24px;
`;

const ParameterKeySpan = styled.span`
    background-color: #fff3e0;
    color: #e65100;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
`;

const ParameterValueSpan = styled.span`
    background-color: #e8f5e8;
    color: #2e7d32;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
`;

const StatusSpan = styled.span<{ $isActive: boolean }>`
    background-color: ${(props) => (props.$isActive ? '#e8f5e8' : '#f5f5f5')};
    color: ${(props) => (props.$isActive ? '#2e7d32' : '#6c757d')};
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 500;
    font-size: 12px;
`;
