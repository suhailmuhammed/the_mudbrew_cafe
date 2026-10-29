/**
 * Lightweight, in-memory sliding window rate limiter
 */
const rateLimits = new Map();

export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests, please try again later.' }) {
  // Periodically clean up old entries (unref so timer does not prevent process exit)
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimits.entries()) {
      if (now - data.resetTime > windowMs) {
        rateLimits.delete(key);
      }
    }
  }, windowMs);
  if (timer && timer.unref) {
    timer.unref();
  }

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.baseUrl || req.path}_${ip}`;
    const now = Date.now();

    const record = rateLimits.get(key) || { count: 0, resetTime: now };

    if (now - record.resetTime > windowMs) {
      record.count = 1;
      record.resetTime = now;
    } else {
      record.count += 1;
    }

    rateLimits.set(key, record);

    if (record.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
}
