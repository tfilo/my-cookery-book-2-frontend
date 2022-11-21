INSERT INTO public."Users"(
	username, password, "firstName", "lastName", "createdAt", "updatedAt")
	VALUES ('Test', '$2a$12$FYZz3tFq.j.CBiu40cU.X.Jlny/b3bD6frd6YLrrniN6YxJr8Wgi6', 'Te', 'Testík', current_timestamp, current_timestamp);

INSERT INTO public."UserRoles"(
	"roleName", "userId", "createdAt", "updatedAt")
	VALUES ('ADMIN', 1, current_timestamp, current_timestamp);

    
