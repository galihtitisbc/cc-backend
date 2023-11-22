/* eslint-disable camelcase */
const { PrismaClient } = require('@prisma/client');

// eslint-disable-next-line import/no-extraneous-dependencies
const { validationResult } = require('express-validator');
const uploadFiles = require('../../helper/uploadFile');

const prisma = new PrismaClient();

const addReport = async (req, res) => {
  const { nama_tempat, lang, long } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    await uploadFiles(req.files);
    const fileNames = [];
    req.files.forEach((element) => {
      fileNames.push({
        gambar: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${element.originalname}`,
      });
    });
    await prisma.report.create({
      data: {
        nama_tempat,
        lang,
        long,
        userId: {
          connect: {
            user_id: req.user.user_id,
          },
        },
        Image: {
          createMany: {
            data: fileNames,
          },
        },
      },
    });
    return res.status(201).json({
      message: 'Sukses Melakukan Report',
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: error.message });
  }
};

const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.report.delete({
      where: {
        report_id: id,
      },
    });
    return res.status(201).json({
      message: 'delete success',
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = { addReport, deleteReport };
