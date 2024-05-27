import NextAuth from 'next-auth';
import { Credentials } from 'next-auth/providers';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import { compare } from 'bcryptjs';

export default NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        await connectToDatabase();
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error('No user found with the email');
        }

        const isValid = await compare(password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return { email: user.email };
      },
    }),
  ],
  session: {
    jwt: true,
  },
  secret: process.env.NEXTAUTH_SECRET,
});
