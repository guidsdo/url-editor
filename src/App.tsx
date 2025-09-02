import styled from "styled-components";
import { observer } from "mobx-react-lite";
import { URLParameterEditor } from "./URLParameterEditor";
import { ParametersTable } from "./ParametersTable";

export const App = observer(() => {
    return (
        <Container>
            <Header>
                <Title>🔗 URL Parameter Editor</Title>
                <Subtitle>Edit URLs and manage query parameters with ease</Subtitle>
            </Header>
            <URLParameterEditor />
            <ParametersTable />
        </Container>
    );
});

const Container = styled.div`
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
`;

const Header = styled.header`
    text-align: center;
    margin-bottom: 30px;
    color: #333;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #2c3e50;
`;

const Subtitle = styled.p`
    font-size: 1.1rem;
    color: #7f8c8d;
    margin: 0;
`;
