/* eslint-disable camelcase */
const { PrismaClient } = require('@prisma/client');

// eslint-disable-next-line import/no-extraneous-dependencies
const { validationResult } = require('express-validator');
const uploadFiles = require('../../helper/uploadFile');

const prisma = new PrismaClient();

const getAllReport = async (req, res) => {
  try {
    const report = await prisma.report.findMany({
      include: {
        Image: true,
      },
    });
    if (report == null) {
      return res.status(200).json({ message: 'Data Kosong' });
    }
    return res.status(200).json({ message: 'Sukses', data: report });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOneReport = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await prisma.report.findUnique({
      where: {
        report_id: id
      },
      include: {
        Image: true,
      }
    });
    if (!report) return res.status(404).json({ message: 'report tidak ditemukan' });
    return res.status(200).json({
      data: report
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: error.message
    });
  }
};

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
    return res.status(200).json({
      message: 'delete success',
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
};

module.exports = {
  addReport, deleteReport, getAllReport, getOneReport,
};
