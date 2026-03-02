<<<<<<< HEAD
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
=======
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
<<<<<<< HEAD
  name: string;
=======
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
<<<<<<< HEAD
=======

  @IsOptional()
  @IsString()
  phone?: string;
>>>>>>> d0fa0b29b430d886d34dfff22e9ab6d23544a73a
}
