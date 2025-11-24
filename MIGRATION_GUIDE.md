# 🔄 Migration Guide - Adaptare Pagini Existente

Ghid pas-cu-pas pentru a face paginile existente din Cruizr fully responsive folosind noul component library.

## 📋 Structura Recomandată

### Înainte (Pagină tipică veche)
```tsx
export default function MyPage() {
  return (
    <div className="container">
      <h1>Title</h1>
      <div className="content">
        {/* content */}
      </div>
    </div>
  );
}
```

### După (Pagină nouă responsive)
```tsx
import { ResponsiveLayout, PageContainer, Card } from '@/components';

export default function MyPage() {
  return (
    <ResponsiveLayout showHeader showBottomNav>
      <PageContainer title="Title">
        <Card>
          {/* content */}
        </Card>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

## 🎯 Migrare Componente Specifice

### 1. Nearby/Discover Page

**Vechi Pattern:**
```tsx
// src/pages/Nearby.tsx (vechi)
export default function Nearby() {
  return (
    <div className="nearby-container">
      <div className="cards-stack">
        {users.map(user => (
          <UserCard key={user.id} {...user} />
        ))}
      </div>
    </div>
  );
}
```

**Nou Pattern (Responsive):**
```tsx
import { ResponsiveLayout, PageContainer, ProfileCard } from '@/components';
import { useResponsive } from '@/hooks/useMediaQuery';

export default function Nearby() {
  const { isMobile } = useResponsive();
  const [users, setUsers] = useState([]);

  return (
    <ResponsiveLayout showHeader showBottomNav>
      <PageContainer
        title={isMobile ? "Discover" : "Nearby Users"}
        subtitle={`${users.length} people nearby`}
      >
        <div className={`
          ${isMobile ? 'px-2' : 'max-w-2xl mx-auto'}
        `}>
          {users.map(user => (
            <ProfileCard
              key={user.id}
              profile={{
                id: user.id,
                name: user.name,
                age: user.age,
                avatar: user.avatar,
                photos: user.photos,
                bio: user.bio,
                car: user.car,
                interests: user.interests,
              }}
              onLike={handleLike}
              onDislike={handleDislike}
              onMessage={handleMessage}
              showActions
            />
          ))}
        </div>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

### 2. Profile Page

**Nou Pattern:**
```tsx
import {
  ResponsiveLayout,
  PageContainer,
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Badge,
  Button,
  CarGrid,
} from '@/components';
import { useResponsive } from '@/hooks/useMediaQuery';

export default function Profile() {
  const { isMobile } = useResponsive();
  const user = useCurrentUser();

  return (
    <ResponsiveLayout showHeader showBottomNav>
      <PageContainer
        title={isMobile ? user.name : "My Profile"}
        action={
          <Button variant="outline" onClick={() => navigate('/edit')}>
            Edit Profile
          </Button>
        }
      >
        {/* Header Card */}
        <Card className="mb-6">
          <div className={`
            flex
            ${isMobile ? 'flex-col items-center text-center' : 'flex-row items-start'}
            gap-6
          `}>
            <Avatar
              src={user.avatar}
              size={isMobile ? '2xl' : 'xl'}
              fallback={user.name}
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{user.name}, {user.age}</h2>
                {user.isVIP && <Badge variant="warning">VIP</Badge>}
              </div>
              <p className="text-gray-600 mb-4">{user.bio}</p>
              
              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{user.matches}</p>
                  <p className="text-xs text-gray-500">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{user.likes}</p>
                  <p className="text-xs text-gray-500">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{user.visits}</p>
                  <p className="text-xs text-gray-500">Visits</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Cars Section */}
        <Card>
          <CardHeader
            title="My Cars"
            action={<Button size="sm">Add Car</Button>}
          />
          <CardBody>
            <CarGrid
              cars={user.cars}
              onCarClick={handleCarClick}
            />
          </CardBody>
        </Card>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

### 3. Chat Page

**Nou Pattern:**
```tsx
import {
  ResponsiveLayout,
  PageContainer,
  ChatList,
  Card,
  SearchBar,
} from '@/components';
import { useResponsive } from '@/hooks/useMediaQuery';

export default function Chat() {
  const { isMobile } = useResponsive();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ResponsiveLayout
      showHeader
      showBottomNav
      headerProps={{
        title: "Messages",
      }}
    >
      <PageContainer>
        {/* Search - Sticky on mobile */}
        <div className={`
          ${isMobile ? 'sticky top-0 z-10 bg-gray-50 pb-4' : 'mb-6'}
        `}>
          <SearchBar
            placeholder="Search conversations..."
            onSearch={setSearchQuery}
          />
        </div>

        {/* Chat List */}
        <Card padding={isMobile ? 'sm' : 'md'}>
          <ChatList
            chats={filteredChats}
            onChatClick={handleChatClick}
            activeChat={activeChatId}
          />
        </Card>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

### 4. Store Page

**Nou Pattern:**
```tsx
import {
  ResponsiveLayout,
  PageContainer,
  StoreGrid,
  TabBar,
  Card,
} from '@/components';
import { useFuelWallet } from '@/hooks/useFuelWallet';

export default function Store() {
  const { balance } = useFuelWallet();
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState([]);

  const categories = [
    { id: 'all', label: 'All Items', icon: '🏬' },
    { id: 'power-ups', label: 'Power-Ups', icon: '⚡' },
    { id: 'frames', label: 'Frames', icon: '🖼️' },
    { id: 'badges', label: 'Badges', icon: '🏆' },
  ];

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => item.category === activeCategory);

  return (
    <ResponsiveLayout showHeader showBottomNav>
      <PageContainer
        title="Store"
        subtitle="Enhance your profile"
      >
        {/* Balance Card */}
        <Card variant="gradient" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Balance</p>
              <p className="text-3xl font-bold text-pink-600">
                🪙 {balance.toLocaleString()}
              </p>
            </div>
            <Button variant="secondary">
              Add Coins
            </Button>
          </div>
        </Card>

        {/* Categories */}
        <TabBar
          tabs={categories}
          activeTab={activeCategory}
          onChange={setActiveCategory}
          variant="pills"
          className="mb-6"
        />

        {/* Items Grid */}
        <StoreGrid
          items={filteredItems}
          userBalance={balance}
          onPurchase={handlePurchase}
        />
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

### 5. Badges Page

**Nou Pattern:**
```tsx
import {
  ResponsiveLayout,
  PageContainer,
  Card,
  CardHeader,
  CardBody,
  Badge,
  TabBar,
} from '@/components';
import { useBadges } from '@/hooks/useBadges';

export default function Badges() {
  const { allBadges, userBadges, categories } = useBadges();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBadges = selectedCategory === 'all'
    ? allBadges
    : allBadges.filter(b => b.category === selectedCategory);

  return (
    <ResponsiveLayout showHeader showBottomNav>
      <PageContainer
        title="Badges"
        subtitle={`${userBadges.length} / ${allBadges.length} unlocked`}
      >
        {/* Progress */}
        <Card variant="gradient" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">
              {Math.round((userBadges.length / allBadges.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
              style={{
                width: `${(userBadges.length / allBadges.length) * 100}%`
              }}
            />
          </div>
        </Card>

        {/* Categories */}
        <TabBar
          tabs={[
            { id: 'all', label: 'All' },
            ...categories.map(cat => ({
              id: cat.id,
              label: cat.name,
            }))
          ]}
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
          className="mb-6"
        />

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map(badge => (
            <Card
              key={badge.id}
              padding="md"
              className={`
                text-center
                ${!badge.unlocked && 'opacity-50 grayscale'}
              `}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
              <p className="text-xs text-gray-600 mb-2">
                {badge.description}
              </p>
              {badge.unlocked ? (
                <Badge variant="success" size="sm">Unlocked</Badge>
              ) : (
                <Badge variant="gray" size="sm">Locked</Badge>
              )}
            </Card>
          ))}
        </div>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

## 🎨 Pattern-uri Responsive Comune

### Grid Responsive
```tsx
// Auto-adapting grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

### Flex Direction Responsive
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">Main Content</div>
  <div className="w-full md:w-64">Sidebar</div>
</div>
```

### Conditional Mobile/Desktop
```tsx
const { isMobile } = useResponsive();

return (
  <div>
    {isMobile ? (
      <MobileCarousel items={items} />
    ) : (
      <DesktopGrid items={items} />
    )}
  </div>
);
```

### Spacing Responsive
```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding se mărește progresiv */}
</div>
```

## ✅ Checklist Migrare Pagină

Pentru fiecare pagină:

- [ ] Wrap în `<ResponsiveLayout>`
- [ ] Folosește `<PageContainer>` pentru titlu și layout
- [ ] Înlocuiește butoanele cu `<Button>` component
- [ ] Înlocuiește input-urile cu `<Input>` component
- [ ] Folosește `<Card>` pentru sectiuni de conținut
- [ ] Adaugă `useResponsive()` pentru conditional rendering
- [ ] Testează pe mobile (< 768px)
- [ ] Testează pe tablet (768px - 1024px)
- [ ] Testează pe desktop (> 1024px)
- [ ] Verifică că Bottom Navigation apare pe mobile
- [ ] Verifică spacing și padding responsive

## 🚀 Tips pentru Productivitate

1. **Începe cu Layout-ul**
   ```tsx
   <ResponsiveLayout>
     <PageContainer title="...">
       {/* adaugă conținut aici */}
     </PageContainer>
   </ResponsiveLayout>
   ```

2. **Folosește IntelliSense**
   - TypeScript autocompletează toate props-urile
   - Hover pentru documentație inline

3. **Copy-Paste din Examples**
   - Vezi `src/examples/ComponentExamples.tsx`
   - Adaptează pentru use case-ul tău

4. **Testează pe Device Real**
   ```bash
   # Găsește IP-ul tău local
   ipconfig getifaddr en0
   
   # Accesează de pe telefon
   http://[YOUR-IP]:5173
   ```

## 📱 Mobile-First Checklist

- [ ] Touch targets >= 44x44px (butoane, links)
- [ ] Text >= 16px (previne auto-zoom pe iOS)
- [ ] Spacing adecvat între elemente (min 8px)
- [ ] Imagini optimizate (lazy loading)
- [ ] Formulare mobile-friendly (keyboard types corecte)
- [ ] Bottom nav visible și accesibil
- [ ] No horizontal scroll
- [ ] Safe area insets respectate

---

**🎉 Happy Coding! Pentru ajutor: consultă COMPONENT_LIBRARY.md sau QUICK_START.md**
