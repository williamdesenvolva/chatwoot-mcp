import type { CreateUserRequest, UpdateUserRequest, UserPublic } from '../types/index.js';
export declare class UserService {
    getUsers(includeInactive?: boolean): Promise<UserPublic[]>;
    getUser(id: string): Promise<UserPublic | null>;
    createUser(data: CreateUserRequest, createdBy: string): Promise<UserPublic>;
    updateUser(id: string, data: UpdateUserRequest, updatedBy: string): Promise<UserPublic | null>;
    deleteUser(id: string, deletedBy: string): Promise<boolean>;
    changePassword(id: string, newPassword: string, changedBy: string): Promise<boolean>;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map