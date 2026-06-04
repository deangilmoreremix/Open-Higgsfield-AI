import { prisma } from "../prisma";

export const UserService = {
  async addCredits(userId, credits) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits,
        },
      },
    });
  },

  async deductCredits(userId, credits) {
    // 1. Get user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < credits) {
      throw new Error("Insufficient credits");
    }

    // 2. Deduct credits
    return await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: credits,
        },
      },
    });
  },
};
