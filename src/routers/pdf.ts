import express from "express";
import multer from "multer";
import parseForm from "../utils/parseForm";
import pdfTools from "../services/pdf-tools";

const pdf = express.Router();

const upload = multer();

pdf.post("/pdf-to-png", upload.any(), async (req, res) => {
  // const file = (req.files || [])[0] || req.file as
  // const { outputType = 'png' } = adaptParseBody(req);
  // pdfTools.pdfToImg()
});

pdf.use("/png-to-pdf", async (req, res) => {
  const { id } = parseForm(req);
  pdfTools.pngToPdf();
});

export default pdf;
