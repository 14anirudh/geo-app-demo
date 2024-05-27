import connectToDatabase from '../../lib/mongodb';
import User from '../../models/User';
import { hash } from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    await connectToDatabase();

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(422).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await hash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created' });
  } else {
    res.status(405).json({ message: 'We only support POST' });
  }
}
