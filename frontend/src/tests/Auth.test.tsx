import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import Auth from "../components/Auth";
import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";

const mockHistoryPush = jest.fn();

jest.mock("react-router-dom", () => ({
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}));

const handlers = [
    rest.post(`/auth/login`, (req, res, ctx) => {
        console.log(`/auth/login`)
        console.log("req", JSON.stringify(req, null, 2))
        console.log("res", JSON.stringify(res, null, 2))
        return res(ctx.status(200), ctx.json({ user: { name: "abc123", email: "abc123", token: "abc123" } }));
        return res(ctx.status(200), ctx.json({ user: { name: "abc123", email: "abc123", token: "abc123" }, name: "abc123", token: "abc123" }));
    }),

];

const server = setupServer(...handlers);

beforeAll(() => {
    server.listen();
});
afterEach(() => {
    server.resetHandlers();
    cleanup();
});
afterAll(() => {
    server.close();
});

describe("Auth Component Test Cases", () => {
    let store: any;
    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
    });
    it("1 :Should render all the elements correctly", async () => {
        render(
            <Provider store={store}>
                <Auth />
            </Provider>
        );
        // screen.debug();
        expect(screen.getByTestId("label-email")).toBeTruthy();
        expect(screen.getByTestId("label-password")).toBeTruthy();
        expect(screen.getByTestId("input-email")).toBeTruthy();
        expect(screen.getByTestId("input-password")).toBeTruthy();
        // expect(screen.getByRole("button")).toBeTruthy();
        // expect(screen.getByTestId("toggle-icon")).toBeTruthy();
    });
    it("3 :Should route to MainPage when login is successful", async () => {
        render(
            <Provider store={store}>
                <Auth />
            </Provider>
        );
        userEvent.click(screen.getByText("Login"));
        expect(
            await screen.findByText("Successfully logged in!")
        ).toBeInTheDocument();
        expect(mockHistoryPush).toBeCalledWith("/user");
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
    });
})