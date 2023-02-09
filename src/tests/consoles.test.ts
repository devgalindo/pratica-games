import app from "app";
import prisma from "config/database";
import httpStatus from "http-status";
import supertest from "supertest";
import { createConsole } from "./factories/console.factory";
import { faker } from "@faker-js/faker"

const api = supertest(app)

beforeEach(async () => {
    await prisma.game.deleteMany()
    await prisma.console.deleteMany()
})

beforeAll(async () => {
    await prisma.game.deleteMany()
    await prisma.console.deleteMany()
})

describe("GET /consoles", () => {
    it("should respond a empty array if there are no consoles", async () => {
        const response = await api.get("/consoles")

        expect(response.body).toHaveLength(0)
        expect(response.body).toEqual([])
    }) 
    it("should respond a console array", async () => {
        await createConsole()
        await createConsole()
        const response = await api.get("/consoles")

        expect(response.body).toHaveLength(2)
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
            })
        ]))
    })
})

describe("GET /consoles/:id", () => {
    it("should respond with status 404 if console's id does not exist", async () => {
        const response = await api.get("/consoles/1")

        expect(response.status).toBe(httpStatus.NOT_FOUND)
    })
    it("should respond a console with the specified id", async () => {
        await createConsole()
        const response = await api.get("/consoles/1")

        expect(response.body).toEqual({
            id: expect.any(Number),
            name: expect.any(String)
        })
    })
})

describe("POST /consoles", () => {
    it("should respond with status 422 when body is not present", async () => {
        const response = await api.post("/consoles")

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
    }) 
    it("should respond with status 422 when body is not valid", async () => {
        const body = {[faker.word.noun()]:faker.word.noun()}
        const response = await api.post("/consoles").send(body)

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
    }) 
    describe("when body is valid", () => {

        const generateValidBody = () => ({
            name: faker.company.name()
        })

        it("should respond with status 409 if console name already exist", async () => {
            const console = await createConsole()
            const body = console

            const response = await api.post("/consoles").send(body)
            expect(response.status).toBe(httpStatus.CONFLICT)
        })
        it("should respond with status 201 and create a new console", async () => {
            const body = generateValidBody()
            const response = await api.post("/consoles").send(body)

            expect(response.status).toBe(httpStatus.CREATED)

            const console = await prisma.console.findFirst()
            expect(console).toBeDefined()
        })
    })
})