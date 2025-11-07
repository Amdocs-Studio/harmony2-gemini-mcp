// Simple test endpoint to verify Vercel deployment
export default (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Vercel serverless function is working',
    path: req.url 
  });
};

