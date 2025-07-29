"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const prisma_1 = __importDefault(require("../src/db/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASS;
    if (!email || !password) {
        throw new Error('Missing ADMIN_EMAIL or ADMIN_PASS in environment variables');
    }
    const superAdmin = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!superAdmin) {
        await prisma_1.default.user.create({
            data: {
                email,
                password: await bcryptjs_1.default.hash(password, 10),
                role: 'ADMIN',
            },
        });
        console.log('✅ Admin user seeded');
    }
    else {
        console.log('ℹ️ Admin user already exists');
    }
}
main()
    .then(() => prisma_1.default.$disconnect())
    .catch((e) => {
    console.error(e);
    prisma_1.default.$disconnect();
    process.exit(1);
});
