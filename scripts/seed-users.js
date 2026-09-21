import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const users = [
  { id: 'U1', name: 'Farmer Demo', email: 'farmer@example.com', password: 'farmer123', role: 'farmer' },
  { id: 'U2', name: 'Operator Demo', email: 'operator@example.com', password: 'operator123', role: 'operator' },
  { id: 'U3', name: 'Admin Demo', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];

(async () => {
  for (const u of users) {
    u.passwordHash = await bcrypt.hash(u.password, 10);
    delete u.password;
  }
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  console.log('Demo users written to data/users.json');
})();
