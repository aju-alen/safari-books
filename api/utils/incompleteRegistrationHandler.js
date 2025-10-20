/**
 * Incomplete Registration Handler
 * 
 * This module provides utilities to handle incomplete publisher registrations
 * with a focus on cleanup and data management.
 */

import { prisma } from './database.js';

/**
 * Clean up old incomplete registrations
 * Removes incomplete registrations older than the specified number of days
 */
export const cleanupOldIncompleteRegistrations = async (daysThreshold = 1) => {
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

/**
 * Get count of incomplete registrations
 * Useful for monitoring and reporting
 */
export const getIncompleteRegistrationCount = async () => {
    const incompleteCompanies = await prisma.company.count({
        where: { isRegistrationComplete: false }
    });
    
    const incompleteAuthors = await prisma.author.count({
        where: { isRegistrationComplete: false }
    });
    
    return {
        incompleteCompanies,
        incompleteAuthors,
        total: incompleteCompanies + incompleteAuthors
    };
};

/**
 * Get incomplete registration data for a specific ID
 * Useful for data recovery or manual processing
 */
export const getIncompleteRegistrationData = async (registrationId, registrationType) => {
    const model = registrationType === 'company' ? prisma.company : prisma.author;
    
    const data = await model.findUnique({
        where: { id: registrationId },
        include: {
            user: {
                select: {
                    email: true,
                    name: true
                }
            }
        }
    });
    
    return data;
};

/**
 * Mark a registration as complete
 * Useful for manual completion or data correction
 */
export const markRegistrationComplete = async (registrationId, registrationType) => {
    const model = registrationType === 'company' ? prisma.company : prisma.author;
    
    const updated = await model.update({
        where: { id: registrationId },
        data: { isRegistrationComplete: true }
    });
    
    return updated;
};

/**
 * Get analytics on incomplete registrations
 * Provides insights for business monitoring
 */
export const getIncompleteRegistrationAnalytics = async (days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const analytics = {
        totalIncomplete: 0,
        incompleteByType: {
            companies: 0,
            authors: 0
        },
        ageDistribution: {
            lessThan1Day: 0,
            oneToThreeDays: 0,
            moreThanThreeDays: 0
        }
    };
    
    // Get incomplete companies
    const incompleteCompanies = await prisma.company.findMany({
        where: { isRegistrationComplete: false },
        select: { registrationStartedAt: true }
    });
    
    // Get incomplete authors
    const incompleteAuthors = await prisma.author.findMany({
        where: { isRegistrationComplete: false },
        select: { registrationStartedAt: true }
    });
    
    analytics.incompleteByType.companies = incompleteCompanies.length;
    analytics.incompleteByType.authors = incompleteAuthors.length;
    analytics.totalIncomplete = incompleteCompanies.length + incompleteAuthors.length;
    
    // Calculate age distribution
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    [...incompleteCompanies, ...incompleteAuthors].forEach(registration => {
        const age = now - registration.registrationStartedAt;
        const ageInDays = age / (24 * 60 * 60 * 1000);
        
        if (ageInDays < 1) {
            analytics.ageDistribution.lessThan1Day++;
        } else if (ageInDays <= 3) {
            analytics.ageDistribution.oneToThreeDays++;
        } else {
            analytics.ageDistribution.moreThanThreeDays++;
        }
    });
    
    return analytics;
};
