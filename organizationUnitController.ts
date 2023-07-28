import express, { Request, Response } from 'express';
import ldap from 'ldapjs';


const router = express.Router();
const ldapClient = ldap.createClient({ url: 'ldap://localhost:10389' });

interface OrganizationUnit {
  id: string;
  name: string;
  description: string;
}

interface Group {
  name: string;
  organizationUnit: string; // Reference to the organization unit id it belongs to
}

const organizationUnits: OrganizationUnit[] = [];
const groups: Group[] = [];

// Function to add an organization unit to LDAP server
function addOrganizationUnitToLDAP(organizationUnit: OrganizationUnit) {
  const entry = {
    objectClass: ['organization', 'top'],
    o: organizationUnit.name,
    description: organizationUnit.description,
  };

  const dn = `o=${organizationUnit.name},ou=OrganizationUnits,dc=example,dc=com`;

  ldapClient.add(dn, entry, (err) => {
    if (err) {
      console.error('LDAP add error for Organization Unit:', organizationUnit.name, err);
    } else {
      console.log('Organization unit added to LDAP:', organizationUnit.name);
    }
  });
}

// Function to add a group to LDAP server
function addGroupToLDAP(group: Group) {
  const entry = {
    objectClass: ['groupOfNames', 'top', 'organization'],
    cn: group.name,
    member: [], // Add members to the group as DN strings when needed
  };

  const dn = `cn=${group.name},o=${group.organizationUnit},ou=OrganizationUnits,dc=example,dc=com`;

  ldapClient.add(dn, entry, (err) => {
    if (err) {
      console.error('LDAP add error for Group:', group.name, err);
    } else {
      console.log('Group added to LDAP:', group.name);
    }
  });
}



// Create Organization Unit
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;

  const newOrganizationUnit: OrganizationUnit = {
    id: Date.now().toString(), // Generate a unique ID (You may use a better approach in a real application)
    name,
    description,
  };

  organizationUnits.push(newOrganizationUnit);
  addOrganizationUnitToLDAP(newOrganizationUnit);
  res.json(newOrganizationUnit);
});

// Read Organization Unit by ID
router.get('/organizationUnits/:id', (req: Request, res: Response) => {
  const organizationUnitId: string = req.params.id;
  const organizationUnit: OrganizationUnit | undefined = organizationUnits.find((unit) => unit.id === organizationUnitId);

  if (organizationUnit) {
    res.json(organizationUnit);
  } else {
    res.status(404).json({ error: 'Organization Unit not found' });
  }
});

// Update Organization Unit by ID
router.put('/organizationUnits/:id', (req: Request, res: Response) => {
  const organizationUnitId: string = req.params.id;
  const updatedOrganizationUnit: OrganizationUnit = req.body;
  const index: number = organizationUnits.findIndex((unit) => unit.id === organizationUnitId);

  if (index !== -1) {
    organizationUnits[index] = { ...organizationUnits[index], ...updatedOrganizationUnit };
    res.json(organizationUnits[index]);
  } else {
    res.status(404).json({ error: 'Organization Unit not found' });
  }
});

// Delete Organization Unit by ID
router.delete('/organizationUnits/:id', (req: Request, res: Response) => {
  const organizationUnitId: string = req.params.id;
  const index: number = organizationUnits.findIndex((unit) => unit.id === organizationUnitId);

  if (index !== -1) {
    const deletedOrganizationUnit: OrganizationUnit = organizationUnits.splice(index, 1)[0];
    res.json(deletedOrganizationUnit);
  } else {
    res.status(404).json({ error: 'Organization Unit not found' });
  }
});

// Create Group associated with an Organization Unit
router.post('/groups', (req: Request, res: Response) => {
  const { name, organizationUnitId } = req.body;
  const organizationUnit: OrganizationUnit | undefined = organizationUnits.find((unit) => unit.id === organizationUnitId);

  if (!organizationUnit) {
    return res.status(404).json({ error: 'Organization Unit not found' });
  }

  const newGroup: Group = {
    name,
    organizationUnit: organizationUnit.name,
  };
  groups.push(newGroup);
  addGroupToLDAP(newGroup);
  res.json(newGroup);
});

// Read Group by Name
router.get('/groups/:name', (req: Request, res: Response) => {
  const groupName: string = req.params.name;
  const group: Group | undefined = groups.find((group) => group.name === groupName);

  if (group) {
    res.json(group);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

// Update Group by Name
router.put('/groups/:name', (req: Request, res: Response) => {
  const groupName: string = req.params.name;
  const updatedGroup: Group = req.body;
  const index: number = groups.findIndex((group) => group.name === groupName);

  if (index !== -1) {
    groups[index] = { ...groups[index], ...updatedGroup };
    res.json(groups[index]);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

// Delete Group by Name
router.delete('/groups/:name', (req: Request, res: Response) => {
  const groupName: string = req.params.name;
  const index: number = groups.findIndex((group) => group.name === groupName);

  if (index !== -1) {
    const deletedGroup: Group = groups.splice(index, 1)[0];
    res.json(deletedGroup);
  } else {
    res.status(404).json({ error: 'Group not found' });
  }
});

export default router;
