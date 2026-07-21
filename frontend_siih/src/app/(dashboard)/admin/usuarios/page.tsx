'use client';
import { useState } from 'react';
import { RoleGuard } from '@/components/layout/RoleGuard';
import { DataTable, ColumnDef } from '@/components/shared/DataTable';
import { User } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { Edit, Shield, Trash } from 'lucide-react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toggleUserStatus, assignRoles, createUsuario, updateUsuario } from '@/services/usuariosService';
import toast from 'react-hot-toast';

const AVAILABLE_ROLES = [
  'Administrador',
  'Director',
  'Médico',
  'Enfermera',
  'Recepcionista',
  'Técnico de Laboratorio',
  'Farmacéutico',
  'Cajero'
];

export default function UsuariosPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state para crear/editar
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state para roles
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const openEditModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUsername(user.username);
      setEmail(user.email);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setCargo(user.perfil?.cargo || '');
      setTelefono(user.perfil?.telefono || '');
      setPassword(''); // Password vacía por defecto al editar (no se actualiza si está vacía)
    } else {
      setSelectedUser(null);
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setCargo('');
      setTelefono('');
      setPassword('');
    }
    setIsModalOpen(true);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setIsRoleModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload: any = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      cargo, 
      telefono
    };

    if (password) {
      payload.password = password;
    }
    
    // Al crear un usuario nuevo, le mandamos los roles por defecto
    // (Si estamos editando, los roles se editan en el modal de roles)
    if (!selectedUser) {
      payload.roles = ['Recepcionista']; // un rol base, luego el admin lo cambia si quiere
    }

    try {
      if (selectedUser) {
        await updateUsuario(selectedUser.id, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        if (!password) {
          toast.error('La contraseña es obligatoria para un nuevo usuario');
          setLoading(false);
          return;
        }
        await createUsuario(payload);
        toast.success('Usuario creado correctamente');
      }
      setIsModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al guardar el usuario. Verifica los datos.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await assignRoles(selectedUser.id, selectedRoles);
      toast.success('Roles asignados correctamente');
      setIsRoleModalOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Error al asignar roles');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    try {
      await toggleUserStatus(selectedUser.id);
      toast.success('Estado del usuario actualizado');
      setRefreshKey(prev => prev + 1);
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const toggleRoleSelection = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const columns: ColumnDef<User>[] = [
    { header: 'Usuario', accessorKey: 'username' },
    { 
      header: 'Nombre', 
      cell: (user) => `${user.first_name} ${user.last_name}` 
    },
    { 
      header: 'Roles', 
      cell: (user) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map(role => (
              <span key={role} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground truncate">
                {role}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">Sin rol</span>
          )}
        </div>
      )
    },
    {
      header: 'Cargo',
      cell: (user) => user.perfil?.cargo || '-'
    },
    { 
      header: 'Estado', 
      cell: (user) => (
        <StatusBadge status={user.is_active ? 'Activo' : 'Baja'} />
      )
    },
    {
      header: 'Acciones',
      cell: (user) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            title="Editar"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(user);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            title="Asignar Roles"
            onClick={(e) => {
              e.stopPropagation();
              openRoleModal(user);
            }}
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            title={user.is_active ? "Dar de baja" : "Activar"}
            className={user.is_active ? "text-destructive" : "text-primary"}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRoles={['Administrador']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">Gestión de usuarios del sistema y asignación de roles.</p>
          </div>
          <Button onClick={() => openEditModal()}>Nuevo Usuario</Button>
        </div>

        <DataTable<User> 
          columns={columns} 
          fetchUrl="/usuarios/" 
          searchPlaceholder="Buscar usuario por nombre o username..."
          key={refreshKey}
        />

        {/* Modal Crear/Editar Usuario */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>{selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombres</Label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Apellidos</Label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usuario (Username)</Label>
                <Input value={username} onChange={e => setUsername(e.target.value)} required disabled={!!selectedUser} />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!selectedUser} placeholder={selectedUser ? "Dejar vacío para no cambiar" : ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Cargo (Perfil)</Label>
                <Input value={cargo} onChange={e => setCargo(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>

            <ModalFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>

        {/* Modal de Roles */}
        <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>Asignar Roles - {selectedUser?.username}</ModalTitle>
          </ModalHeader>
          <div className="py-4 space-y-3">
            {AVAILABLE_ROLES.map(role => (
              <label key={role} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-muted">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRoleSelection(role)}
                />
                <span className="text-sm font-medium">{role}</span>
              </label>
            ))}
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveRoles} disabled={loading}>
              {loading ? 'Asignando...' : 'Guardar Roles'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Modal Desactivar/Activar */}
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleToggleStatus}
          title={selectedUser?.is_active ? "Desactivar Usuario" : "Activar Usuario"}
          description={`¿Estás seguro de que deseas ${selectedUser?.is_active ? 'desactivar' : 'activar'} al usuario ${selectedUser?.username}?`}
          variant={selectedUser?.is_active ? "destructive" : "default"}
        />
      </div>
    </RoleGuard>
  );
}
