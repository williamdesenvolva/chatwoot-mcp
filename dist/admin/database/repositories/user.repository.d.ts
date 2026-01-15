import type { User, UserPublic, CreateUserRequest, UpdateUserRequest } from '../../types/index.js';
export declare class UserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(includeInactive?: boolean): Promise<UserPublic[]>;
    create(data: CreateUserRequest): Promise<UserPublic>;
    update(id: string, data: UpdateUserRequest): Promise<UserPublic | null>;
    delete(id: string): Promise<boolean>;
    verifyPassword(user: User, password: string): Promise<boolean>;
    count(): Promise<number>;
    private toPublic;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=user.repository.d.ts.map