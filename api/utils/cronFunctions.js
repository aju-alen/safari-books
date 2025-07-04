import { PrismaClient } from '@prisma/client'

import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

export const getUsersWithUnfinishedBooks = async () => {
  const users = await prisma.user.findMany({
    where: {
      Library: {
        some: {
          status: "IN_PROGRESS",
        },
      },
      pushToken: {
        not: null,
      },
    },
    select: {
      pushToken: true,
    },
  });
  
  // Extract only the pushToken values
  return users.map(user => user.pushToken);
};