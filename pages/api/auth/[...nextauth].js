import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import { compare } from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
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
