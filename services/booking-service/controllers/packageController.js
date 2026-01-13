const Package = require('../models/Package');

exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPackage = async (req, res) => {
  try {
    const newPkg = await Package.create(req.body);
    res.status(201).json(newPkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};