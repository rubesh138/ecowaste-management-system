const WasteCategory = require('../models/WasteCategory');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public / Private
const getCategories = async (req, res, next) => {
  try {
    const { all } = req.query;
    let query = {};

    // If not requesting all (or not admin), only show active categories
    if (!all || (req.user && req.user.role !== 'admin')) {
      query.isActive = true;
    }

    const categories = await WasteCategory.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide category name' });
    }

    const existingCategory = await WasteCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await WasteCategory.create({
      name,
      description: description || '',
      icon: icon || 'Recycle',
      color: color || 'emerald',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description, icon, color, isActive } = req.body;

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
