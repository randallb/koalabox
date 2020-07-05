import request from "supertest";
import app from "../app";

jest.mock("fs");

describe("sample test", () => {
  it("should test", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
  it("should test", async () => {
    const response = await request(app).get("/404");
    expect(response.statusCode).toBe(404);
  });
  it("should test", async () => {
    const response = await request(app).post("/newTodo");
    expect(response.statusCode).toBe(200);
  });
});
