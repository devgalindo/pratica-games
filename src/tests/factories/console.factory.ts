import prisma from "config/database";
import { faker } from "@faker-js/faker"

export async function createConsole() {
    return prisma.console.create({
        data: {
            name: faker.company.name()
        }
    })
}