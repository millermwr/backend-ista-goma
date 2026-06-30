import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'userType',
        'status',
        'plainPassword',
      ],
    });
  }

  async findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'userType',
        'status',
        'plainPassword',
      ],
    });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateData: any) {
    const dataToUpdate: any = { ...updateData };
    if (updateData.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateData.password, 10);
      dataToUpdate.plainPassword = updateData.password;
      delete dataToUpdate.password;
    }
    await this.usersRepository.update(id, dataToUpdate);
    return this.findById(id);
  }

  async remove(id: string) {
    await this.usersRepository.delete(id);
  }
}
