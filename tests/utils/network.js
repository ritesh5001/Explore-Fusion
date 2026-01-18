const isConnectionRefused = (error) => {
  if (!error) return false;
  if (error.code === 'ECONNREFUSED') return true;
  if (Array.isArray(error.errors)) {
    return error.errors.some((item) => item?.code === 'ECONNREFUSED');
  }
  return false;
};

const requestWithSkip = async (requestFn, label) => {
  try {
    return await requestFn();
  } catch (error) {
    if (isConnectionRefused(error)) {
      console.warn(`[${label}] skipped because target service is unavailable (${error.message || error.code})`);
      return null;
    }
    throw error;
  }
};

module.exports = { requestWithSkip, isConnectionRefused };
