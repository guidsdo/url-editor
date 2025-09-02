import styled from "styled-components";
import { useContextOrThrow } from "../helpers/reactHelpers";
import { UrlEditorStoreContext } from "../stores/URLEditorStore";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";

export const ParametersTable = observer(() => {
    const urlEditorStore = useContextOrThrow(UrlEditorStoreContext);
    const parameters = urlEditorStore.cachedParameters;

    return (
        <TableContainer>
            <Title>Parameter Overview</Title>
            {parameters.size > 0 ? (
                <ParameterTable>
                    <thead>
                        <tr>
                            <TableHeader>Parameter</TableHeader>
                            <TableHeader>Value</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {[...parameters].map(([key, value], index) => (
                            <ParameterTableRow key={`${key}-${index}`} value={value} paramKey={key} />
                        ))}
                    </tbody>
                </ParameterTable>
            ) : (
                <EmptyState>No parameters found. Try editing the URL above to add some query parameters!</EmptyState>
            )}
        </TableContainer>
    );
});

const ParameterTableRow = observer(({ paramKey, value }: { value: string; paramKey: string }) => {
    const urlEditorStore = useContextOrThrow(UrlEditorStoreContext);

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLSpanElement>) => {
            const value = e.target.textContent;
            urlEditorStore.setParameterValue(paramKey, value);
        },
        [urlEditorStore]
    );

    return (
        <TableRow>
            <TableCell>
                <ParameterKeySpan>{paramKey}</ParameterKeySpan>
            </TableCell>
            <TableCell>
                <ParameterValueSpan contentEditable suppressContentEditableWarning={true} onBlur={handleBlur} children={value} />
            </TableCell>
        </TableRow>
    );
});

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

    opacity: ${props => (props.$isInactive ? 0.6 : 1)};
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

// const StatusSpan = styled.span<{ $isActive: boolean }>`
//     background-color: ${props => (props.$isActive ? "#e8f5e8" : "#f5f5f5")};
//     color: ${props => (props.$isActive ? "#2e7d32" : "#6c757d")};
//     padding: 2px 6px;
//     border-radius: 3px;
//     font-weight: 500;
//     font-size: 12px;
// `;
