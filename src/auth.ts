import NextAuth from 'next-auth';

// Заглушка для настроек аутентификации
const authConfig = {
  providers: [],
  callbacks: {
    async session({ session, token }: any) {
      return session;
    },
    async authorized({ auth, request }: any) {
      return true;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
};

// Экспортируем авторизацию из NextAuth
export const { auth, signIn, signOut } = NextAuth(authConfig); 