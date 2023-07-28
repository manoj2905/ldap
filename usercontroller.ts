import express, { Request, Response } from 'express';
import ldap from 'ldapjs';
// import { User } from './types';

const router = express.Router();
const ldapClient = ldap.createClient({ url:'ldap://localhost:10389' });
interface User {
  UserId: string;
  FullName: string;
  Password: string;
  EmployeeNumber: string;
  mobile: string;
  mail: string;
  personalTitle: string;
}

const users: User[] = [];

// Create User in ApacheDS and In-Memory Database
router.post('/', (req: Request, res: Response) => {
  const { UserId, FullName, Password, EmployeeNumber, mobile, mail, personalTitle } = req.body;

  // Define the DN for the new user
  const newUserDN = `uid=${UserId},ou=users,ou=system`;

  // Define the user attributes
  const newUserAttributes = {
    objectClass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top'],
    cn: FullName,
    sn: FullName,
    uid: UserId,
    mail: mail,
    userPassword: Password,
    mobile: mobile,
    employeeNumber: EmployeeNumber,
    personalTitle: personalTitle,
  };

  console.log('Adding new user with DN:', newUserDN);
  console.log('New user attributes:', newUserAttributes);

  // Add the new user entry to the LDAP directory
  ldapClient.bind(`uid=admin,ou=users,ou=system`, 'secret', (bindErr) => {
    if (bindErr) {
      console.error('LDAP bind error:', bindErr);
      return res.status(500).json({ message: 'Failed to bind to LDAP' });
    }

    ldapClient.add(newUserDN, newUserAttributes, (addErr) => {
      if (addErr) {
        console.error('LDAP add error:', addErr);
        return res.status(500).json({ message: 'Failed to add user to LDAP', error: addErr });
      }

      // Add the user to the in-memory database
      const newUser: User = {
        UserId,
        FullName,
        Password,
        EmployeeNumber,
        mobile,
        mail,
        personalTitle,
      };
      users.push(newUser);
      res.json({ message: 'User registration successful!', newUser });
    });
  });
});


// Read User from ApacheDS

router.get('/users/:UserId', (req: Request, res: Response) => {
  const userId: string = req.params.UserId;
  const userDN = `uid=${userId},ou=users,ou=system`;

  ldapClient.search(userDN, { scope: 'base' }, (searchErr, searchRes) => {
    if (searchErr) {
      console.error('LDAP search error:', searchErr);
      return res.status(500).json({ message: 'Failed to fetch user from LDAP', error: searchErr });
    }

    let user: any;
    searchRes.on('searchEntry', (entry) => {
      user = entry.object;
    });

    searchRes.on('end', () => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    });
  });
});

// Update User in ApacheDS
router.put('/users/:UserId', (req: Request, res: Response) => {
  const userId: string = req.params.UserId;
  const updatedUser: User = req.body;
  const userDN = `uid=${userId},ou=users,ou=system`;

  ldapClient.modify(userDN, [
    new ldap.Change({
      operation: 'replace',
      modification: {
        cn: updatedUser.FullName,
        sn: updatedUser.FullName,
        mail: updatedUser.mail,
        userPassword: updatedUser.Password,
        mobile: updatedUser.mobile,
        employeeId: updatedUser.EmployeeNumber,
        personalTitle: updatedUser.personalTitle,
      },
    }),
  ], (modifyErr) => {
    if (modifyErr) {
      console.error('LDAP modify error:', modifyErr);
      return res.status(500).json({ message: 'Failed to update user in LDAP', error: modifyErr });
    }

    res.json({ message: 'User updated successfully!' });
  });
});

// Delete User from ApacheDS
router.delete('/users/:UserId', (req: Request, res: Response) => {
  const userId: string = req.params.UserId;
  const userDN = `uid=${userId},ou=users,ou=system`;

  ldapClient.del(userDN, (delErr) => {
    if (delErr) {
      console.error('LDAP delete error:', delErr);
      return res.status(500).json({ message: 'Failed to delete user from LDAP', error: delErr });
    }

    res.json({ message: 'User deleted successfully!' });
  });
});

export default router;
