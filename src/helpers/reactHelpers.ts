import { Context, useContext } from "react";

export function useContextOrThrow<T>(context: Context<T | null>): T {
    const value = useContext(context);

    if (!value) {
        throw new Error(
            `Context ${context.displayName ?? ""} is not provided. Please provide it${context.displayName ? ` using <${context.displayName}.Provider>` : ""}.`
        );
    }

    return value;
}
