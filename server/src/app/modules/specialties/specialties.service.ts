import { Specialties } from '@prisma/client';
import { Request } from 'express';
import { fileUploader } from '../../../helpers/fileUploader';
import prisma from '../../../shared/prisma';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import { redisHelper } from '../../../helpers/redisHelper';

const insertIntoDB = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  // New specialty add হলে পুরানো cache invalid হবে
  await redisHelper.deleteCacheByPattern('specialties:*');

  return result;
};

const getAllFromDB = async (options: IPaginationOptions) => {
  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const cacheKey = `specialties:page=${page}:limit=${limit}:sortBy=${sortBy}:sortOrder=${sortOrder}`;

  const result = await redisHelper.getOrSetCache(cacheKey, async () => {
    const data = await prisma.specialties.findMany({
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const total = await prisma.specialties.count();

    return {
      meta: {
        total,
        page,
        limit,
      },
      data,
    };
  });

  return result;
};

const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });

  // Delete হলে specialties list cache clear হবে
  await redisHelper.deleteCacheByPattern('specialties:*');

  return result;
};

export const SpecialtiesService = {
  insertIntoDB,
  getAllFromDB,
  deleteFromDB,
};
