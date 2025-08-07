import { PrismaClient } from "@prisma/client"

declare global {
    var prisma: PrismaClient | undefined
}

const db = globalThis.prisma || new PrismaClient()
globalThis.prisma = db

export default db;