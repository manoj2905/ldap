import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import ldap from 'ldapjs';

const router = express.Router();
const ldapClient = ldap.createClient({ url: 'ldap://localhost:10389' }); 

// Middleware
router.use(bodyParser.json());

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Authenticate the user by binding with LDAP server
  ldapClient.bind(`uid=${username},ou=system`, password, (err) => {
    if (err) {
      console.error('LDAP authentication error:', err);
      return res.status(401).json({ message: 'Authentication failed: Invalid credentials' });
    }

    // If authentication succeeds, perform a search to fetch user details (optional)
    ldapClient.search(`ou=system`, { filter: `(uid=${username})` }, (searchErr, searchRes) => {
      if (searchErr) {
        console.error('LDAP search error:', searchErr);
        return res.status(500).json({ message: 'LDAP search error' });
      }

      searchRes.on('searchEntry', (entry) => {
        console.log('User details:', entry.object);
        // You can choose to send the user details back to the client if needed
      });

      searchRes.on('error', (searchErr) => {
        console.error('LDAP search error:', searchErr);
        return res.status(500).json({ message: 'LDAP search error' });
      });

      searchRes.on('end', () => {
        res.json({ message: 'Login successful!' });
      });
    });
  });
});
router.post('/register', (req: Request, res: Response) => {
  const { username, fullName, password, email } = req.body;

  // Define the DN for the new user
  const newUserDN = `uid=${username},ou=users,ou=system`;

  // Define the user attributes
  const newUserAttributes = {
    objectClass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top'],
    cn: fullName,
    sn: fullName,
    uid: username,
    mail: email,
    userPassword: password
  };

  // Add the new user entry to the LDAP directory
  ldapClient.bind(`uid=${username},ou=system`, password, (bindErr) => {
    if (bindErr) {
      console.error('LDAP bind error:', bindErr);
      return res.status(500).json({ message: 'Failed to bind to LDAP' });
    }

    ldapClient.add(newUserDN, newUserAttributes, (addErr) => {
      if (addErr) {
        console.error('LDAP add error:', addErr);
        return res.status(500).json({ message: 'Failed to add user to LDAP', error: addErr });
      }

      res.json({ message: 'User registration successful!' });
    });
  });
});
export default router;
