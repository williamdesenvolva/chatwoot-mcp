import { userRepository } from '../database/repositories/user.repository.js';
import { sessionRepository } from '../database/repositories/session.repository.js';
import { auditRepository } from '../database/repositories/audit.repository.js';
export class UserService {
    async getUsers(includeInactive = false) {
        return userRepository.findAll(includeInactive);
    }
    async getUser(id) {
        const user = await userRepository.findById(id);
        if (!user)
            return null;
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at,
        };
    }
    async createUser(data, createdBy) {
        // Check if email already exists
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw new Error('Email already registered');
        }
        const user = await userRepository.create(data);
        await auditRepository.create({
            user_id: createdBy,
            action: 'user.create',
            resource_type: 'user',
            resource_id: user.id,
            metadata: { email: data.email, role: data.role || 'admin' },
        });
        return user;
    }
    async updateUser(id, data, updatedBy) {
        // If changing email, check it doesn't exist
        if (data.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing && existing.id !== id) {
                throw new Error('Email already registered');
            }
        }
        const user = await userRepository.update(id, data);
        if (user) {
            await auditRepository.create({
                user_id: updatedBy,
                action: 'user.update',
                resource_type: 'user',
                resource_id: id,
                metadata: { fields: Object.keys(data) },
            });
            // If user is being deactivated, invalidate all their sessions
            if (data.is_active === false) {
                await sessionRepository.deleteByUserId(id);
            }
        }
        return user;
    }
    async deleteUser(id, deletedBy) {
        // Can't delete yourself
        if (id === deletedBy) {
            throw new Error('Cannot delete your own account');
        }
        const result = await userRepository.delete(id);
        if (result) {
            // Invalidate all sessions
            await sessionRepository.deleteByUserId(id);
            await auditRepository.create({
                user_id: deletedBy,
                action: 'user.delete',
                resource_type: 'user',
                resource_id: id,
            });
        }
        return result;
    }
    async changePassword(id, newPassword, changedBy) {
        const user = await userRepository.update(id, { password: newPassword });
        if (user) {
            // If changing own password, don't invalidate sessions
            // If admin changing another user's password, invalidate their sessions
            if (id !== changedBy) {
                await sessionRepository.deleteByUserId(id);
            }
            await auditRepository.create({
                user_id: changedBy,
                action: 'user.change_password',
                resource_type: 'user',
                resource_id: id,
            });
            return true;
        }
        return false;
    }
}
export const userService = new UserService();
//# sourceMappingURL=user.service.js.map