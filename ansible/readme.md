# Readme file for deploying spring-boot service with Angular Front End On Remote host

Note: This guide is only for deploying spring-boot service and Angular application on the remote cent-os machine &  
To Run ansible-playbook we need Linux/unix local machine (Windows user needs virtual box)

### Step 0 : Give permission to server if using pem
      Copy pub key:     ssh-copy-id -i ~/.ssh/bruntha_sm DunyaPRODAppVM1 -f
      Test ssh::        ssh -i ~/.ssh/bruntha_sm dunya-azureuser@13.68.193.49


### Step 2 : Install Ansible on linux/Unix local machine
1.In ubuntu machine run following command in terminal ->$ sudo apt install ansible / sudo apt-get install ansible -y
2.If ansible is correctly installed then following command gives version of ansible ->$ansible --version / $ansible
-version


### Step 3 : We need to configure remote hosts ip addresses To run tasks On them
1.We need to add remote hosts ip addresses in local machine's hosts file

    1.1) you can find file "hosts" Under "/etc/ansible"  folder in your local machine
    
    1.2) Add remote hosts ip addresses under some group name
    Note:We need to provide this group name in playBook inorder to run tasks against this group

    Example: In host file, add remoteIp1 and remoteIp2 Under servers group
            [servers]
            remoteIp1
            remoteIp2
    
    1.3) You can Refer sampleHostFile's line 19 & 20 to view how to add group name and ip addresses

    1.4) indicate -hosts:groupName in top of playbook
         example: -hosts:servers

### Step 4: Prepare nginx.conf,spring-boot JAR,Angular tar.gz,.service file in local machine

#### We need to prepare some files and configs in Our local machine

    1.Prepare nginx.conf On local machine
      configure nginx.conf based on our needs
      Note:This Repository's nginx.conf configured to listen on port:9030 for www.ip/service
      and front-end application on www.ip/
    
    2.Prepare Fat-Jar of your springboot application
      use command : mvn clean install

    3.Prepare .service file to Run spring-boot application as a background service 
      Note: Why ".service" file ? if we run spring-boot application using java -jar jarName , it's run's on terminal of remote host.

      This Repository's polar.service file prepared for run polar application
        
      you have to prepare .service for your application
        
      You can Reuse polar.service file by
            1. rename the file
                Ex: polar.service to xyx.service(your service name)

            2. Edit line 6 with your Jar name
               line 6 of polar.service => ExecStart=/bin/java -Xms128m -Xmx256m -jar polar-service-1.1.0.0.jar
               change polar-service-1.1.0.0.jar to abc.jar(your jar name)

    4. Prepare .tar.gz file of your Angular Application
      to  create tar.gz
      tar -czvf <application-name/some-name>.tar.gz <application-folder>

### Step 5: Need to change some values of variables in Playbook

#### we need to copy some files and configs From our local Machines that's why we need to change some values of variables

    1. Change the values of following variables in Play-book
       ->serviceLocal,nginxConfLocal,testJARLocal,serviceName,frontEndApplication,frontEndApplicationName
    
    2. discription of variables is given bellow

        2.1) serviceLocal->local location of .service file                     example value:/home/pirathees/Documents/service/polar.service
        2.2) nginxConfLocal   ->local location of nginx.conf                   example value:/home/pirathees/Documents/nginx/nginx.conf
        2.3) testJARLocal -> local location of Jar that You like to deploy     example value:/home/pirathees/Downloads/Fat Jr/polar-service-1.1.0.0.jar
        2.4) serviceName ->.service Name that You like to run in Background    example value:polar.service
        2.5) frontEndApplication -> local location of Angular-Applciation's tar.gz
        2.6)frontEndApplicationName -> Name of the tar.gz(with-out extension)

### Step 6:Run Ansible playbook

1)you need to have root access in all Remote hosts

2)Run playbook on local machine using following command:
command format --> $ ansible-playbook localLocationOfBook --user=remote_username -e "ansible_sudo_pass=remote_password"

    Ex:
    $ ansible-playbook /home/pirathees/Desktop/playbooks/finalBook.yml --user=pirathees -e "ansible_sudo_pass=pirathees"
    $ ansible-playbook /home/senzmate/Documents/Projects/SenzMate/ansible_deployment_magma/finalBook.yml --user=azureuser -e "ansible_sudo_pass="
    Note-> to Run in this way,You need to have same username,pwd in all Remote hosts
    
    
    ansible-playbook ansible/finalBook.yml --user=dunya-azureuser
    ansible-playbook ansible/bookUpdate.yml --user=dunya-azureuser

# important

1)remote username needs to same as local machine's username

    To have diffrent usernames between remote and local -> we needs to configure Play-book with "remote_user: remote_username" ;
    
    https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html

# important 2

1) If nginx doesn't Redirect to relevant applications, check the permission of the files, and folders(on path) related
   to the application and set them as 755
   (including /home/user )

# Optional

1) Main Tasks are divided into sub tasks

   we can disable/skip main tasks as well as subtasks by using "when=false" module

   Example:

   Task "Install and Configure VerneMQ" is disabled with help of line 143

   SubTask " Create and Install Cert Using Nginx Plugin" is disabled with help of line 215

# Optional 2

If you run the playbook again against the remote host, add when=false to the tasks to reduce running time.