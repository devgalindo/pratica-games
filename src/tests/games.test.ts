import app from "app";
import prisma from "config/database";
import httpStatus from "http-status";
import supertest from "supertest";
import { createConsole } from "./factories/console.factory";
import { faker } from "@faker-js/faker"
import { createGame } from "./factories/game.factory";

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

describe("GET /games", () => {
    it("should respond a empty array if there are no games", async () => {
        const response = await api.get("/games")

        expect(response.body).toHaveLength(0)
        expect(response.body).toEqual([])
    }) 
    it("should respond a games array", async () => {
        const console1 = await createConsole()
        const console2 = await createConsole()
        await createGame(console1.id)
        await createGame(console2.id)
        const response = await api.get("/games")

        expect(response.body).toHaveLength(2)
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                consoleId: expect.any(Number)
            })
        ]))
    })
})

describe("GET /games/:id", () => {
    it("should respond with status 404 if game's id does not exist", async () => {
        const response = await api.get("/games/1")

        expect(response.status).toBe(httpStatus.NOT_FOUND)
    })
    it("should respond a game with the specified consoleId", async () => {
        const console = await createConsole()
        await createGame(console.id)
        const response = await api.get("/games/1")

        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            consoleId: expect.any(Number)
        }))
        expect(response.body.consoleId).toBe(console.id)
    })
})

describe("POST /games", () => {

    it("should respond with status 422 when body is not present", async () => {
        const response = await api.post("/games")

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
    }) 
    it("should respond with status 422 when body is not valid", async () => {
        //create a invalid body
        const body = {[faker.word.noun()]:faker.word.noun()}
        const response = await api.post("/games").send(body)

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY)
    }) 
    describe("when body is valid", () => {
        const generateValidBody = (consoleId: number) => ({
            title: faker.lorem.sentence(2),
            consoleId
        })

        it("should respond with status 409 if game title already exist", async () => {
            const console = await createConsole()
            const game = await createGame(console.id)
            delete game.id
            const body = game

            const response = await api.post("/games").send(body)
            expect(response.status).toBe(httpStatus.CONFLICT)
        })
        it("should respond with status 409 if consoleid does not exist", async () => {

            const body = generateValidBody(faker.datatype.number(100))

            const response = await api.post("/games").send(body)
            expect(response.status).toBe(httpStatus.CONFLICT)
        })
        it("should respond with status 201 and create a new game", async () => {
            const console = await createConsole()
            const body = generateValidBody(console.id)

            const response = await api.post("/games").send(body)

            expect(response.status).toBe(httpStatus.CREATED)

            const game = await prisma.game.findFirst()
            expect(game).toBeDefined()
        })
    })
})