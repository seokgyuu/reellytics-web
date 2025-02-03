export async function registerUser({ username, email, firstName, lastName, password }: any) {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_KEYCLOAK_REGISTER_URL!, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KEYCLOAK_ADMIN_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          enabled: true,
          firstName,
          lastName,
          credentials: [
            {
              type: 'password',
              value: password,
              temporary: false,
            },
          ],
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`사용자 등록 실패: ${JSON.stringify(errorData)}`);
      }
  
      console.log('✅ 사용자 등록 성공:', email);
      return '사용자 등록 성공';
    } catch (error) {
      console.error('❌ 사용자 등록 오류:', error);
      throw new Error('사용자 등록 중 오류 발생');
    }
  }
  