// MockData.js

// 1. กิจกรรมทั้งหมด (5 งาน: Regis 2, Ongoing 2, Complete 1)
export const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'City Night Run 2026',
    daysLeft: 12,
    status: 'Open',
    image: 'https://images.unsplash.com/photo-1532444458054-015fddf96cce?q=80&w=500',
    fullDesc: 'สัมผัสประสบการณ์การวิ่งยามค่ำคืนผ่านแลนด์มาร์คสำคัญของเมืองหลวง เส้นทางราบวิ่งง่าย เหมาะสำหรับเก็บ New PB หรือนักวิ่งมือใหม่ที่อยากสัมผัสบรรยากาศแสงสีเสียง',
    startDate: '15 Mar 2026',
    endDate: '20 Mar 2026',
    distance: '114KM',
    packages: [
        { name: '1. Finisher Shirt Only', price: '450', items: 'เสื้อ T-Shirt ลาย Limited (ต้องส่งผล)' },
        { name: '2. Medal Only', price: '350', items: 'เหรียญที่ระลึก (ต้องส่งผล)' },
        { name: '3. Full Bundle', price: '750', items: 'เสื้อ T-Shirt + เหรียญที่ระลึก (ต้องส่งผล)' },
        { name: '4. Charity (No Run)', price: '950', items: 'เสื้อ T-Shirt + เหรียญ (ส่งของทันที ไม่ต้องส่งผลวิ่ง)' }
      ]
  },
  {
    id: 'e2',
    title: 'Songkran Splash Run',
    daysLeft: 30,
    status: 'Open',
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=500',
    fullDesc: 'วิ่งคลายร้อนไปกับเทศกาลสงกรานต์ สนุกกับการฉีดน้ำตลอดเส้นทาง พร้อมดนตรี EDM สุดมันส์ที่จุดเข้าเส้นชัย',
    startDate: '13 Apr 2026',
    endDate: '15 Apr 2026',
    distance: '5KM / 10KM',
    packages: [
      { name: 'Splash Pack', price: '450', items: 'เสื้อแขนกุด, ซองกันน้ำโทรศัพท์, เหรียญ, BIB' }
    ]
  },
  {
    id: 'e3',
    title: 'Mountain Trail 50K',
    daysLeft: 3,
    status: 'Ongoing',
    image: 'https://images.unsplash.com/photo-1551632432-c735e8a0cd52?q=80&w=500',
    fullDesc: 'ท้าทายขีดจำกัดบนเส้นทางธรรมชาติที่ลาดชันและสวยงามที่สุดในภาคเหนือ ผ่านดอยหลวงเชียงดาวและป่าสน',
    startDate: '01 Feb 2026',
    endDate: '28 Feb 2026',
    distance: '50KM',
    packages: [
      { name: 'Ultra Trail', price: '1,500', items: 'เสื้อ Finisher (เฉพาะผู้จบ), เสื้อวิ่ง, เป้น้ำ, อาหาร 3 มื้อ' }
    ]
  },
  {
    id: 'e4',
    title: 'Jan 30KM Challenge',
    daysLeft: 1,
    status: 'Ongoing',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=500',
    fullDesc: 'กิจกรรมสะสมระยะทางประจำเดือนมกราคม วิ่งที่ไหนก็ได้ เมื่อไหร่ก็ได้ ให้ครบ 30KM ภายในเดือนนี้',
    startDate: '01 Jan 2026',
    endDate: '31 Jan 2026',
    distance: '30KM (Cumulative)',
    packages: [
      { name: 'E-Badge Only', price: '0', items: 'E-Certificate, E-Badge บนโปรไฟล์' },
      { name: 'Physical Medal', price: '350', items: 'เหรียญรางวัลจัดส่งถึงบ้าน, E-Certificate' }
    ]
  },
  {
    id: 'e5',
    title: 'Winter Forest 10K',
    daysLeft: 0,
    status: 'Complete',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=500',
    fullDesc: 'วิ่งรับลมหนาวในป่าสน สัมผัสอากาศบริสุทธิ์และทางวิ่งที่ปกคลุมด้วยไอหมอก',
    startDate: '10 Dec 2025',
    endDate: '15 Dec 2025',
    distance: '10KM',
    packages: [
      { name: 'Finisher Pack', price: '600', items: 'เสื้อกันหนาววิ่ง, เหรียญไม้สน, BIB' }

    ]
  },
  {
      id: 'e6',
      title: 'Sakura Blossom Run',
      status: 'Complete',
      image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=500',
      endDate: '20 Nov 2025',
      distance: '5KM'
    },
    {
      id: 'e7',
      title: 'Beach Sunset Half Marathon',
      status: 'Complete',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500',
      endDate: '05 Oct 2025',
      distance: '21KM'
    },
    {
      id: 'e8',
      title: 'Midnight City Glow',
      status: 'Complete',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500',
      endDate: '12 Sep 2025',
      distance: '10KM'
    },
    {
      id: 'e9',
      title: 'Charity Hope Run',
      status: 'Complete',
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=500',
      endDate: '30 Aug 2025',
      distance: '3KM'
    },
    {
      id: 'e10',
      title: 'Ancient Temple Trail',
      status: 'Complete',
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=500',
      endDate: '15 Jul 2025',
      distance: '15KM'
    },
    {
      id: 'e11',
      title: 'Rainy Season Challenge',
      status: 'Complete',
      image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=500',
      endDate: '01 Jun 2025',
      distance: '30KM'
    }
];

// 2. งานของฉัน (3 งาน: Ongoing 2, Upcoming 1 - อ้างอิงจาก e3, e4, e2)
export const MOCK_MY_RUNS = [
  {
    id: 'r1',
    event_id: 'e3',
    title: 'Mountain Trail 50K',
    status: 'Ongoing',
    currentKm: 25.0,
    targetKm: 50,
    daysLeft: 3,
    image: 'https://images.unsplash.com/photo-1551632432-c735e8a0cd52?q=80&w=500'
  },
  {
    id: 'r2',
    event_id: 'e4',
    title: 'Jan 30KM Challenge',
    status: 'Ongoing',
    currentKm: 28.5,
    targetKm: 30,
    daysLeft: 1,
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=500'
  },
  {
    id: 'r3',
    event_id: 'e2',
    title: 'Songkran Splash Run',
    status: 'Upcoming',
    currentKm: 0,
    targetKm: 10,
    daysUntilStart: 2,
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=500'
  },
];

// 3. อันดับผู้นำ (12 คน)
export const MOCK_RANKINGS = [
  { id: 'u1', name: 'Alex Stride', events: 52, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'u2', name: 'Jane Runner', events: 48, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'u3', name: 'Sunny Gold', events: 45, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'u4', name: 'You', events: 42, avatar: 'https://i.pravatar.cc/150?u=me' },
  { id: 'u5', name: 'Somchai V.', events: 38, avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: 'u6', name: 'Peter Park', events: 35, avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 'u7', name: 'Lilly Active', events: 31, avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 'u8', name: 'Noon Runner', events: 28, avatar: 'https://i.pravatar.cc/150?u=8' },
  { id: 'u9', name: 'K. Somsak', events: 25, avatar: 'https://i.pravatar.cc/150?u=9' },
  { id: 'u10', name: 'Fastest Cat', events: 22, avatar: 'https://i.pravatar.cc/150?u=10' },
  { id: 'u11', name: 'Iron Man', events: 18, avatar: 'https://i.pravatar.cc/150?u=11' },
  { id: 'u12', name: 'Brave Heart', events: 15, avatar: 'https://i.pravatar.cc/150?u=12' },
];

// 4. การแจ้งเตือน (10 อัน: อ่านแล้ว 5, ยังไม่อ่าน 5)
export const MOCK_NOTIFICATIONS = [
  // ยังไม่อ่าน (Unread)
  { id: 'n1', type: 'system', title: 'ยินดีด้วย!', desc: 'คุณทำระยะทางสะสมครบ 25KM แล้ว', time: '2 ชม. ที่แล้ว', read: false },
  { id: 'n2', type: 'event', title: 'งานวิ่งใหม่', desc: 'เปิดรับสมัคร Songkran Splash Run แล้ว', time: '5 ชม. ที่แล้ว', read: false },
  { id: 'n3', type: 'rank', title: 'อันดับเปลี่ยน', desc: 'คุณถูกแซงโดย Jane Runner!', time: '10 ชม. ที่แล้ว', read: false },
  { id: 'n4', type: 'system', title: 'ยืนยันผล', desc: 'ผลการวิ่ง Mountain Trail ของคุณได้รับอนุมัติ', time: '12 ชม. ที่แล้ว', read: false },
  { id: 'n5', type: 'event', title: 'ใกล้หมดเวลา', desc: 'Jan 30KM Challenge เหลือเวลาอีกเพียง 1 วัน', time: '15 ชม. ที่แล้ว', read: false },

  // อ่านแล้ว (Read)
  { id: 'n6', type: 'rank', title: 'เข้าสู่ Top 5', desc: 'คุณติดอันดับ 4 ของสัปดาห์นี้', time: '1 วันที่แล้ว', read: true },
  { id: 'n7', type: 'system', title: 'เป้าหมายสำเร็จ', desc: 'คุณพิชิต Winter Forest 10K เรียบร้อย', time: '2 วันที่แล้ว', read: true },
  { id: 'n8', type: 'event', title: 'ประกาศผล', desc: 'ตรวจสอบรายชื่อผู้โชคดีกิจกรรม City Night', time: '3 วันที่แล้ว', read: true },
  { id: 'n9', type: 'system', title: 'ต้อนรับ', desc: 'ยินดีต้อนรับเข้าสู่ GoldStride!', time: '1 สัปดาห์ที่แล้ว', read: true },
  { id: 'n10', type: 'rank', title: 'เริ่มต้นซีซั่น', desc: 'เริ่มการเก็บคะแนนประจำเดือนมกราคม', time: '2 สัปดาห์ที่แล้ว', read: true },
];