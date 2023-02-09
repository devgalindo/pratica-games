import app from "app";
import prisma from "config/database";
import httpStatus from "http-status";
import supertest from "supertest";

const api = supertest(app)

beforeEach(async () => {
    await prisma.game.deleteMany()
})

describe("GET /consoles", () => {
    it("should respond a empty array if there are no consoles", async () => {
        const response = await api.get("/consoles")

        expect(response.body).toHaveLength(0)
        expect(response.body).toEqual([])
    }) 
    it("should respond a consoles array", async () => {
        //criar console
        //criar console
        const response = await api.get("/console")

        expect(response.body).toHaveLength(2)
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
            })
        ]))
    })
})

describe("GET /games/:id", () => {
    it("should respond with status 404 if console's id does not exist", async () => {
        const response = await api.get("/consoles/1")

        expect(response.status).toBe(httpStatus.NOT_FOUND)
    })
    it("should respond a console with the specified id", async () => {
        //criar console
        const response = await api.get("/consoles/1")

        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String)
        }))
    })
})

describe("POST /consoles", () => {
    it("should respond with status 400 when body is not present", async () => {
        const response = await api.post("/consoles")

        expect(response.status).toBe(httpStatus.BAD_REQUEST)
    }) 
    it("should respond with status 400 when body is not valid", async () => {
        //create a invalid body
        const body = {blabla:"blabla"}
        const response = await api.post("/consoles").send(body)

        expect(response.status).toBe(httpStatus.BAD_REQUEST)
    }) 
    describe("when body is valid", () => {
        //create a valid body

        it("should respond with status 409 if console name already exist", async () => {
            const body = "generateValidBody()"
            await prisma.game.create({
                data: body
            })

            const response = await api.post("/console").send(body)
            expect(response.status).toBe(httpStatus.CONFLICT)
        })
        it("should respond with status 201 and create a new game", async () => {
            const body = "generateValidBody()"
            const response = await api.post("/games").send(body)

            expect(response.status).toBe(httpStatus.CREATED)

            //find first id do body
            const game = await prisma.game.findFirst()
            expect(game).toBeDefined()
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
        //criar game
        //criar game
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
        //criar game
        const response = await api.get("/games/1")

        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            consoleId: expect.any(Number)
        }))
    })
})

describe("POST /games", () => {
    it("should respond with status 400 when body is not present", async () => {
        const response = await api.post("/games")

        expect(response.status).toBe(httpStatus.BAD_REQUEST)
    }) 
    it("should respond with status 400 when body is not valid", async () => {
        //create a invalid body
        const body = {blabla:"blabla"}
        const response = await api.post("/games").send(body)

        expect(response.status).toBe(httpStatus.BAD_REQUEST)
    }) 
    describe("when body is valid", () => {
        //create a valid body

        it("should respond with status 409 if game title already exist", async () => {
            const body = "generateValidBody()"
            await prisma.game.create({
                data: body
            })

            const response = await api.post("/games").send(body)
            expect(response.status).toBe(httpStatus.CONFLICT)
        })
        it("should respond with status 409 if consoleid does not exist", async () => {
            const body = "generateValidBody()"
            body.consoleId = "número aleatório"
            await prisma.game.create({
                data: body
            })

            const response = await api.post("/games").send(body)
            expect(response.status).toBe(httpStatus.CONFLICT)
        })
        it("should respond with status 201 and create a new game", async () => {
            const body = "generateValidBody()"
            const response = await api.post("/games").send(body)

            expect(response.status).toBe(httpStatus.CREATED)

            //find first id do body
            const game = await prisma.game.findFirst()
            expect(game).toBeDefined()
        })
    })
})