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


// Clean up very old incomplete registrations (older than 7 days)
export const cleanupOldIncompleteRegistrations = async (daysThreshold = 7) => {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
  
  // Delete old incomplete companies
  const deletedCompanies = await prisma.company.deleteMany({
    where: {
      isRegistrationComplete: false,
      registrationStartedAt: {
        lte: thresholdDate
      }
    }
  });
  
  // Delete old incomplete authors
  const deletedAuthors = await prisma.author.deleteMany({
    where: {
      isRegistrationComplete: false,
      registrationStartedAt: {
        lte: thresholdDate
      }
    }
  });
  
  return {
    deletedCompanies: deletedCompanies.count,
    deletedAuthors: deletedAuthors.count
  };
};