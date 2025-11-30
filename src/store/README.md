# Auth Store (React Context)

Централизованное управление состоянием авторизации через React Context API.

## Использование

### В компонентах

```jsx
import { useAuth } from '../store/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth()

  if (loading) {
    return <div>Загрузка...</div>
  }

  if (!isAuthenticated) {
    return <div>Не авторизован</div>
  }

  return (
    <div>
      <p>Привет, {user.username}!</p>
      <button onClick={logout}>Выйти</button>
    </div>
  )
}
```

## API

### `useAuth()` Hook

Возвращает объект с следующими свойствами:

- `user` - объект пользователя (null если не авторизован)
- `isAuthenticated` - boolean, статус авторизации
- `loading` - boolean, идет ли проверка авторизации
- `login(username, password)` - функция входа, возвращает `{ success: boolean, error?: string }`
- `logout()` - функция выхода
- `checkAuth()` - функция проверки авторизации

## Примеры

### Вход в систему

```jsx
const { login } = useAuth()

const handleLogin = async () => {
  const result = await login(username, password)
  if (result.success) {
    // Успешный вход
    navigate('/')
  } else {
    // Ошибка
    setError(result.error)
  }
}
```

### Выход из системы

```jsx
const { logout } = useAuth()

const handleLogout = () => {
  logout()
  navigate('/login')
}
```

### Проверка авторизации

```jsx
const { isAuthenticated, user } = useAuth()

if (isAuthenticated) {
  console.log('Пользователь:', user.username)
}
```

