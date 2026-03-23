import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('JWT Secrets are not defined in environment variables');
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    // Plain-text password comparison as requested
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include detailed profile and role in JWT payload
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        fullName: `${user.name} ${user.lname}`
      }, 
      ACCESS_TOKEN_SECRET!, 
      { expiresIn: ACCESS_TOKEN_EXPIRY as any }
    );
    
    const refreshToken = jwt.sign(
      { id: user.id }, 
      REFRESH_TOKEN_SECRET!, 
      { expiresIn: REFRESH_TOKEN_EXPIRY as any }
    );

    // Store refresh token in DB using TypeORM
    user.refresh_token = refreshToken;
    await userRepository.save(user);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set a non-httpOnly canary cookie for the frontend to check session presence
    res.cookie('sb-has-session', 'true', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return the full profile structure
    res.json({ 
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        mname: user.mname,
        lname: user.lname,
        suffix: user.suffix,
        email: user.email,
        phone_number: user.phone_number,
        sex: user.sex,
        age: user.age,
        country_code: user.country_code,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) return res.sendStatus(401);

  try {
    const payload: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ 
        id: payload.id, 
        refresh_token: refreshToken 
    });

    if (!user) return res.sendStatus(403);

    // Rotate refresh token with updated payload
    const newAccessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        fullName: `${user.name} ${user.lname}`
      }, 
      ACCESS_TOKEN_SECRET!, 
      { expiresIn: ACCESS_TOKEN_EXPIRY as any }
    );
    
    const newRefreshToken = jwt.sign(
      { id: user.id }, 
      REFRESH_TOKEN_SECRET!, 
      { expiresIn: REFRESH_TOKEN_EXPIRY as any }
    );

    user.refresh_token = newRefreshToken;
    await userRepository.save(user);

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Set a non-httpOnly canary cookie for the frontend to check session presence
    res.cookie('sb-has-session', 'true', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ 
      accessToken: newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        mname: user.mname,
        lname: user.lname,
        suffix: user.suffix,
        email: user.email,
        phone_number: user.phone_number,
        sex: user.sex,
        age: user.age,
        country_code: user.country_code,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    res.clearCookie('sb-has-session');
    res.sendStatus(403);
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  if (refreshToken) {
    try {
      const payload: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ id: payload.id });
      
      if (user) {
        user.refresh_token = null as any;
        await userRepository.save(user);
      }
    } catch (e) {
      // Ignore verify errors on logout
    }
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
  res.clearCookie('sb-has-session');
  res.sendStatus(200);
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) return res.sendStatus(401);

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) return res.sendStatus(404);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        mname: user.mname,
        lname: user.lname,
        suffix: user.suffix,
        email: user.email,
        phone_number: user.phone_number,
        sex: user.sex,
        age: user.age,
        country_code: user.country_code,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get Me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
