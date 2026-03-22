import { Request, Response } from 'express';
import { loginService } from '../services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            res.status(400).json({ error: "Email e senha são obrigatórios." });
            return;
        }

        const result = await loginService(email, password);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};
