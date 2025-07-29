import { Request, Response } from 'express';
import prisma from '../../db/prisma';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import { getUserNameFromToken } from '../../utils/extractName';

// GET all components by section
export const getComponentsBySection = async (req: Request, res: Response) => {
  const sectionId = Number(req.query.section_id);
  const components = await prisma.aboutUsComponent.findMany({
    where: { sectionId },
    orderBy: { sequence_number: 'asc' },
  });

  res.json({
    results: components.map((c) => ({
      ...c,
      created_at: c.created_at,
      updated_at: c.updated_at,
    })),
  });
};

// CREATE component
export const createComponent = async (req: Request, res: Response) => {
  try {
    const {
      section,
      sequence_number,
      heading,
      sub_heading,
      description,
      is_active,
      precentage,
    } = req.body;

    const created_by = await getUserNameFromToken(req);

    const sectionId = Number(section);
    const seqNum = Number(sequence_number);
    if (seqNum != null && seqNum <= 0) {
      res.status(400).json({
        success: false,
        message: `sequence_number is not positive`,
      });
      return;
    }
    const duplicate = await prisma.aboutUsComponent.findFirst({
      where: {
        sectionId,
        sequence_number: seqNum,
      },
    });

    if (duplicate) {
       res.status(400).json({
        success: false,
        message: `This sequence number already exists`,
      });
      return;
    }

    let image: string | null = null;
    if (req.file?.buffer) {
      const upload = await uploadToCloudinary(req.file.buffer, 'aboutus_component');
      image = upload.secure_url;
    }

    const component = await prisma.aboutUsComponent.create({
      data: {
        sectionId,
        sequence_number: seqNum,
        heading,
        sub_heading,
        description,
        image,
        is_active: is_active === 'true' || is_active === true,
        precentage,
        created_by,
        updated_by: created_by,
      },
    });

    res.status(201).json({
      success: true,
      result: {
        ...component,
        created_at: component.created_at,
        updated_at: component.updated_at,
      },
    });
  } catch (err) {
    console.error('Create component error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// UPDATE component
export const updateComponent = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const sectionId = Number(req.query.section_id);
    const existing = await prisma.aboutUsComponent.findUnique({ where: { id } });

    if (!existing) {
       res.status(404).json({ success: false, message: 'Component not found' });
       return;
    }

    const {
      sequence_number,
      heading,
      sub_heading,
      description,
      is_active,
      precentage,
    } = req.body;

    const seqNum = Number(sequence_number);
    if (!isNaN(seqNum) && seqNum <= 0) {
       res.status(400).json({
        success: false,
        message: `sequence_number must be a positive number`,
      });
      return;
    }

    if (
      typeof sequence_number !== 'undefined' &&
      seqNum !== existing.sequence_number
    ) {
      const duplicate = await prisma.aboutUsComponent.findFirst({
        where: {
          sectionId,
          sequence_number: seqNum,
          NOT: { id },
        },
      });

      if (duplicate) {
         res.status(400).json({
          success: false,
          message: `This sequence number already exists`,
        });
        return
      }
    }

    let image = existing.image;
    if (req.file?.buffer) {
      const upload = await uploadToCloudinary(req.file.buffer, 'aboutus_component');
      image = upload.secure_url;
    }

    const updated_by = await getUserNameFromToken(req);

    const updated = await prisma.aboutUsComponent.update({
      where: { id },
      data: {
        sectionId,
        sequence_number:
          typeof sequence_number !== 'undefined' ? seqNum : existing.sequence_number,
        heading:
          typeof heading !== 'undefined' ? heading : existing.heading,
        sub_heading:
          typeof sub_heading !== 'undefined' ? sub_heading : existing.sub_heading,
        description:
          typeof description !== 'undefined' ? description : existing.description,
        precentage:
          typeof precentage !== 'undefined' ? precentage : existing.precentage,
        image,
        is_active:
          typeof is_active !== 'undefined'
            ? is_active === 'true' || is_active === true
            : existing.is_active,
        updated_by,
      },
    });

    res.json({
      success: true,
      message: 'Component updated',
      result: {
        ...updated,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    });
  } catch (err) {
    console.error('Update component error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE component
export const deleteComponent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const sectionId = Number(req.query.section_id); // <- optional usage

  const existing = await prisma.aboutUsComponent.findUnique({ where: { id } });

  if (!existing) {
     res.status(404).json({ success: false, message: 'Component not found' });
     return
  }

  // Optional validation: ensure the component belongs to the given section
  if (sectionId && existing.sectionId !== sectionId) {
     res.status(400).json({ success: false, message: 'Section ID mismatch' });
     return
  }

  await prisma.aboutUsComponent.delete({ where: { id } });

  res.json({ success: true, message: 'Component deleted successfully' });
};
