import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: any) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      const err: any = new Error('User already exists');
      err.status = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }

  async login(data: any) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      const err: any = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any,
    });

    return { user: { id: user.id, email: user.email, name: user.name }, token };
  }
}
